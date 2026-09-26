"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";

type Point = { x: number; y: number };

export type SignaturePadHandle = {
  isEmpty: () => boolean;
  toBlob: () => Promise<Blob | null>;
  clear: () => void;
};

export function SignaturePad({
  onChange,
  padRef,
}: {
  onChange?: (empty: boolean) => void;
  padRef?: React.MutableRefObject<SignaturePadHandle | null>;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<Point | null>(null);
  const hasInk = useRef(false);
  const [empty, setEmpty] = useState(true);
  const labelId = useId();

  function markDrawn(next: boolean) {
    hasInk.current = next;
    setEmpty(!next);
    onChange?.(!next);
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointerPos(e);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !last.current) return;
    const point = pointerPos(e);
    ctx.strokeStyle = "#14294f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
    if (!hasInk.current) markDrawn(true);
  }

  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    last.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    markDrawn(false);
  }

  useEffect(() => {
    const handle: SignaturePadHandle = {
      isEmpty: () => !hasInk.current,
      clear,
      toBlob: () =>
        new Promise((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas || !hasInk.current) {
            resolve(null);
            return;
          }
          canvas.toBlob((blob) => resolve(blob), "image/png");
        }),
    };
    if (padRef) padRef.current = handle;
    return () => {
      if (padRef) padRef.current = null;
    };
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p id={labelId} className="text-sm font-medium text-text">
          {t("contract.drawLabel")}
        </p>
        <Button type="button" variant="ghost" className="min-h-9 px-3 text-sm" onClick={clear}>
          {t("contract.clearSignature")}
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        aria-labelledby={labelId}
        className="h-36 w-full touch-none rounded-xl border border-border-strong bg-white dark:bg-neutral-100"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <p className="text-xs text-text-secondary">
        {empty ? t("contract.drawHint") : t("contract.drawReady")}
      </p>
    </div>
  );
}
