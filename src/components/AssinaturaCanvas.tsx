"use client";

// Assinatura desenhada no dedo — canvas puro, sem lib.

import { useEffect, useRef, useState } from "react";

export default function AssinaturaCanvas({
  valor,
  onChange,
}: {
  valor: string | null; // dataURL salvo
  onChange: (dataURL: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const temTraco = useRef(false);
  const [editando, setEditando] = useState(!valor);
  const [versao, setVersao] = useState(0); // incrementa para limpar o canvas

  useEffect(() => {
    if (!editando) return;
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    temTraco.current = false;
  }, [editando, versao]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  if (!editando && valor) {
    return (
      <div className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={valor} alt="Assinatura" className="h-40 w-full rounded-md border border-slate-300 bg-white object-contain" />
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setEditando(true);
          }}
          className="text-sm font-medium text-marinho-claro underline"
        >
          Refazer assinatura
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="h-40 w-full touch-none rounded-md border border-slate-300 bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          desenhando.current = true;
          const ctx = e.currentTarget.getContext("2d")!;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!desenhando.current) return;
          const ctx = e.currentTarget.getContext("2d")!;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          temTraco.current = true;
        }}
        onPointerUp={() => (desenhando.current = false)}
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setVersao((v) => v + 1)}
          className="text-sm font-medium text-slate-600 underline"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={() => {
            if (temTraco.current) {
              onChange(canvasRef.current!.toDataURL("image/png"));
              setEditando(false);
            }
          }}
          className="btn-secundario rounded-md px-4 py-1.5 text-sm"
        >
          Confirmar assinatura
        </button>
      </div>
    </div>
  );
}
