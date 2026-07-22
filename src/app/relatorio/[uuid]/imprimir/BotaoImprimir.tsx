"use client";

export default function BotaoImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-marinho px-4 py-2 font-semibold text-white print:hidden"
    >
      Baixar PDF / Imprimir
    </button>
  );
}
