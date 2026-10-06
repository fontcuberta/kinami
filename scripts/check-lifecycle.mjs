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
const copy=load("src/i18n/lifecycle.ts",{});
function fixture({user=true,entity={title:"My home",name:"My circle"},error=null}={}) {
 const calls=[];const invalidations=[];
 const query={select(){return this},eq(){return this},async maybeSingle(){return {data:entity,error:null}}};
 const db={auth:{getUser:async()=>({data:{user:user?{id:"owner"}:null}})},from:()=>query,rpc:async(name,args)=>{calls.push({name,args});return {error}}};
 const action=load("src/lib/lifecycle-actions.ts",{"@/lib/supabase/server":{createClient:async()=>db},"@/i18n/server":{getTranslator:async()=>({locale:"en"})},"@/i18n/lifecycle":copy,"next/cache":{revalidatePath:(...args)=>invalidations.push(args)},"next/navigation":{redirect:path=>{throw new Error("redirect:"+path)}}}).manageEntity;
 const run=async(operation="delete_home",confirmation="My home",id="11111111-1111-4111-8111-111111111111")=>{const form=new FormData();form.set("operation",operation);form.set("id",id);form.set("confirmation",confirmation);return action(null,form)};
 return {calls,invalidations,run};
}
for(const options of [{user:false},{entity:null}]){const f=fixture(options);assert.ok((await f.run()).error);assert.equal(f.calls.length,0)}
for(const args of [["invalid"],["delete_home","wrong"],["delete_home","My home","bad-id"]]){const f=fixture();assert.ok((await f.run(...args)).error);assert.equal(f.calls.length,0)}
for(const error of [{message:"last_admin"},{message:"not_authorized"},{message:"missing function",code:"PGRST202"}]){const f=fixture({error});assert.ok((await f.run()).error);assert.equal(f.invalidations.length,0)}
for(const [op,name,destination] of [["delete_home","My home","/homes"],["delete_circle","My circle","/circles"],["leave_circle","","/circles"]]){const f=fixture();await assert.rejects(()=>f.run(op,name),new RegExp("redirect:"+destination));assert.equal(f.calls.length,1);assert.equal(f.calls[0].name,"manage_home_or_circle");assert.equal(f.calls[0].args.operation,op);assert.equal(f.invalidations.length,1)}
console.log("PASS: 11 lifecycle action checks (authentication, missing records, confirmation, validation, database errors and successful redirects). Database permissions require migration 009 and live verification.");
