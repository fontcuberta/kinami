"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { circleCopy } from "@/i18n/circles-experience";
import { CreateCircleForm, JoinCircleForm } from "@/components/circle-forms";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";

export function CircleEntryActions({
  initialAction,
}: {
  initialAction?: "join" | "create";
}) {
  const { locale } = useI18n();
  const c = circleCopy(locale);
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<"join" | "create">(
    initialAction ?? "join",
  );
  useEffect(() => {
    if (initialAction) dialog.current?.showModal();
  }, [initialAction]);
  function open(next: "join" | "create") {
    setAction(next);
    dialog.current?.showModal();
  }
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => open("join")}>
          {c.join}
        </Button>
        <Button onClick={() => open("create")}>
          <PlusIcon className="h-4 w-4" />
          {c.create}
        </Button>
      </div>
      <dialog
        ref={dialog}
        aria-label={action === "join" ? c.join : c.create}
        className="circle-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="mb-5 flex justify-end">
          <Button variant="ghost" onClick={() => dialog.current?.close()}>
            {c.close} <span aria-hidden="true">×</span>
          </Button>
        </div>
        {action === "join" ? <JoinCircleForm /> : <CreateCircleForm />}
      </dialog>
    </>
  );
}
