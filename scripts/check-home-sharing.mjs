import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual server action with an isolated database boundary. No live credentials or writes.
function load(path, imports) {
  const code = ts.transpileModule(
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (id) => {
      assert.ok(id in imports, `Unexpected import ${id}`);
      return imports[id];
    },
    FormData,
  });
  return exports;
}
const demo = load("src/lib/demo.ts", {});
const rules = load("src/lib/home-sharing.ts", { "@/lib/demo": demo });
function fixture({
  user = "owner",
  owner = "owner",
  member = true,
  databaseError = false,
} = {}) {
  const writes = [];
  const revalidated = [];
  const db = {
    auth: {
      getUser: async () => ({ data: { user: user ? { id: user } : null } }),
    },
    from(table) {
      const filters = {};
      const query = {
        select() {
          return this;
        },
        eq(key, value) {
          filters[key] = value;
          return this;
        },
        async maybeSingle() {
          return {
            data:
              table === "homes"
                ? owner
                  ? { owner_id: owner }
                  : null
                : member
                  ? { user_id: user }
                  : null,
            error: null,
          };
        },
        async upsert(row, options) {
          writes.push({ table, operation: "upsert", row, options });
          return { error: databaseError ? {} : null };
        },
        delete() {
          writes.push({ table, operation: "delete", filters });
          return this;
        },
        then(resolve) {
          return Promise.resolve({ error: databaseError ? {} : null }).then(
            resolve,
          );
        },
      };
      return query;
    },
  };
  const action = load("src/lib/home-sharing-actions.ts", {
    "next/cache": { revalidatePath: (p) => revalidated.push(p) },
    "@/lib/supabase/server": { createClient: async () => db },
    "@/i18n/server": { getTranslator: async () => ({ t: (key) => key }) },
    "@/lib/home-sharing": rules,
  }).setHomeCircleSharing;
  return {
    writes,
    revalidated,
    run: async (operation = "share", circle = "circle-a") => {
      const form = new FormData();
      form.set("home_id", "home-a");
      form.set("circle_id", circle);
      form.set("operation", operation);
      return action(null, form);
    },
  };
}
let passed = 0;
{
  const f = fixture({ owner: "someone-else" });
  assert.ok((await f.run("remove")).error);
  assert.equal(f.writes.length, 0);
  passed++;
}
for (const options of [
  { user: null },
  { owner: "someone-else" },
  { owner: null },
  { member: false },
]) {
  const f = fixture(options);
  assert.ok((await f.run()).error);
  assert.equal(f.writes.length, 0);
  passed++;
}
{
  const f = fixture();
  assert.ok((await f.run("share", demo.DEMO_CIRCLE_ID)).error);
  assert.equal(f.writes.length, 0);
  passed++;
}
{
  const f = fixture();
  assert.ok((await f.run("delete-home")).error);
  assert.equal(f.writes.length, 0);
  passed++;
}
{
  const f = fixture();
  assert.equal((await f.run()).shared, true);
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].table, "home_circles");
  assert.equal(f.writes[0].row.home_id, "home-a");
  assert.equal(f.writes[0].row.circle_id, "circle-a");
  assert.equal(f.writes[0].options.ignoreDuplicates, true);
  assert.deepEqual(f.revalidated, [
    "/homes",
    "/homes/home-a",
    "/circles",
    "/circles/circle-a",
    "/explore",
  ]);
  passed++;
}
{
  const f = fixture({ member: false });
  assert.equal((await f.run("remove")).shared, false);
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].table, "home_circles");
  assert.equal(f.writes[0].operation, "delete");
  assert.deepEqual(f.writes[0].filters, {
    home_id: "home-a",
    circle_id: "circle-a",
  });
  passed++;
}
{
  const f = fixture({ databaseError: true });
  assert.ok((await f.run()).error);
  assert.equal(f.revalidated.length, 0);
  passed++;
}
console.log(
  `PASS: ${passed} sharing checks — ownership, membership, demo guard, scoped removal, idempotency, errors and revalidation.`,
);
