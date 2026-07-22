import { salvarEmpresa } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function Empresa({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireUser("GESTOR");
  const { erro } = await searchParams;
  const empresa = await prisma.empresa.findUnique({ where: { id: 1 } });

  const input = "w-full rounded-md border border-slate-300 p-2 text-sm";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dados da empresa</h1>
        <p className="text-sm text-slate-500">
          Aparecem no cabeçalho de todos os relatórios e PDFs — é a sua marca diante do cliente.
        </p>
      </div>

      {erro === "nome" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">O nome da empresa é obrigatório.</p>
      )}
      {erro === "logo" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Logo inválida — use JPEG, PNG ou WebP com até 2MB.
        </p>
      )}

      <form action={salvarEmpresa} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nome da empresa *</span>
          <input type="text" name="nome" required defaultValue={empresa?.nome ?? ""} className={input} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">CNPJ</span>
            <input type="text" name="cnpj" defaultValue={empresa?.cnpj ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Telefone</span>
            <input type="text" name="telefone" defaultValue={empresa?.telefone ?? ""} className={input} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input type="email" name="email" defaultValue={empresa?.email ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Endereço</span>
          <input type="text" name="endereco" defaultValue={empresa?.endereco ?? ""} className={input} />
        </label>
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Logo (sai em todos os relatórios)</span>
          {empresa?.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/uploads/${empresa.logo}`}
              alt="Logo atual"
              className="mb-2 h-16 w-auto rounded-md border border-slate-200 bg-white object-contain p-1"
            />
          )}
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="text-sm" />
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Salvar</button>
      </form>
    </div>
  );
}
