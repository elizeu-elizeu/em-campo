import Link from "next/link";
import { salvarConfig } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function Parametrizacoes() {
  await requireUser("GESTOR");
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  const usarNomeEmpresa = config?.usarNomeEmpresa ?? true;
  const exigirFoto = config?.exigirFoto ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Parametrizações</h1>
        <p className="text-sm text-slate-500">Personalize o app e as regras de preenchimento.</p>
      </div>

      <form action={salvarConfig} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Personalização</h2>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name="usarNomeEmpresa" defaultChecked={usarNomeEmpresa} className="mt-0.5" />
            <span>
              Exibir o <strong>nome da empresa</strong> no app do técnico (no lugar de &quot;EmCampo&quot;).
              O nome e a logo se cadastram em{" "}
              <Link href="/painel/empresa" className="text-marinho-claro underline">
                Empresa
              </Link>
              .
            </span>
          </label>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Regras de preenchimento</h2>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name="exigirFoto" defaultChecked={exigirFoto} className="mt-0.5" />
            <span>
              Exigir <strong>ao menos uma foto</strong> em todo relatório antes do envio.
            </span>
          </label>
          <p className="mt-2 text-xs text-slate-500">
            A obrigatoriedade de cada campo específico se define por modelo, em{" "}
            <Link href="/painel/modelos" className="text-marinho-claro underline">
              Modelos
            </Link>{" "}
            — cada campo tem o botão Obrigatório.
          </p>
        </div>

        <button className="rounded-md bg-marinho px-4 py-2 text-sm font-semibold text-white">Salvar</button>
      </form>

      <div className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Permissões</h2>
        <p>
          Papéis (técnico/gestor), ativação e redefinição de senha se gerenciam em{" "}
          <Link href="/painel/usuarios" className="text-marinho-claro underline">
            Usuários
          </Link>
          . Técnicos só veem e editam os próprios relatórios; apenas gestores aprovam, devolvem e alteram
          modelos.
        </p>
      </div>
    </div>
  );
}
