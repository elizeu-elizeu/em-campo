// Biblioteca de modelos prontos por segmento — o gestor começa com 1 clique.
// Cada modelo vira linhas reais de Modelo/Campo ao ser usado (editável depois).

import type { TipoCampo } from "./tipos";

type CampoPronto = {
  tipo: TipoCampo;
  rotulo: string;
  obrigatorio?: boolean;
  opcoes?: string[];
  multipla?: boolean;
  noCabecalho?: boolean;
};

export type ModeloPronto = {
  slug: string;
  nome: string;
  segmento: string;
  campos: CampoPronto[];
};

export const MODELOS_PRONTOS: ModeloPronto[] = [
  {
    slug: "ar-condicionado",
    nome: "Manutenção de ar-condicionado",
    segmento: "Climatização",
    campos: [
      { tipo: "TEXTO_CURTO", rotulo: "Equipamento (marca/modelo)", obrigatorio: true, noCabecalho: true },
      { tipo: "TEXTO_CURTO", rotulo: "Local de instalação", noCabecalho: true },
      { tipo: "ESCOLHA", rotulo: "Tipo de serviço", obrigatorio: true, opcoes: ["Limpeza", "Manutenção preventiva", "Manutenção corretiva", "Instalação"] },
      { tipo: "SIM_NAO", rotulo: "Filtros limpos/substituídos" },
      { tipo: "SIM_NAO", rotulo: "Gás verificado" },
      { tipo: "NUMERO", rotulo: "Temperatura de saída (°C)" },
      { tipo: "ESCOLHA", rotulo: "Estado geral do equipamento", obrigatorio: true, opcoes: ["Ótimo", "Bom", "Regular", "Ruim"] },
      { tipo: "TEXTO_LONGO", rotulo: "Serviços executados", obrigatorio: true },
      { tipo: "FOTO", rotulo: "Fotos do equipamento" },
      { tipo: "ASSINATURA", rotulo: "Assinatura do responsável" },
    ],
  },
  {
    slug: "eletrica",
    nome: "Serviço elétrico",
    segmento: "Elétrica",
    campos: [
      { tipo: "TEXTO_CURTO", rotulo: "Local/circuito atendido", obrigatorio: true, noCabecalho: true },
      { tipo: "ESCOLHA", rotulo: "Tipo de serviço", obrigatorio: true, opcoes: ["Instalação", "Reparo", "Vistoria", "Troca de componente"] },
      { tipo: "ESCOLHA", rotulo: "Itens verificados", multipla: true, opcoes: ["Quadro de distribuição", "Disjuntores", "Aterramento", "Tomadas", "Iluminação", "Fiação"] },
      { tipo: "SIM_NAO", rotulo: "Teste de funcionamento realizado", obrigatorio: true },
      { tipo: "SIM_NAO", rotulo: "Risco identificado no local" },
      { tipo: "TEXTO_LONGO", rotulo: "Descrição do serviço", obrigatorio: true },
      { tipo: "FOTO", rotulo: "Fotos antes/depois" },
      { tipo: "ASSINATURA", rotulo: "Assinatura do cliente" },
    ],
  },
  {
    slug: "dedetizacao",
    nome: "Dedetização",
    segmento: "Controle de pragas",
    campos: [
      { tipo: "ESCOLHA", rotulo: "Praga-alvo", obrigatorio: true, multipla: true, opcoes: ["Baratas", "Ratos", "Cupins", "Formigas", "Escorpiões", "Mosquitos"], noCabecalho: true },
      { tipo: "ESCOLHA", rotulo: "Método aplicado", obrigatorio: true, opcoes: ["Pulverização", "Gel", "Iscas", "Polvilhamento", "Termonebulização"] },
      { tipo: "TEXTO_CURTO", rotulo: "Produto utilizado", obrigatorio: true },
      { tipo: "NUMERO", rotulo: "Área tratada (m²)" },
      { tipo: "SIM_NAO", rotulo: "Local liberado para uso" },
      { tipo: "TEXTO_LONGO", rotulo: "Áreas tratadas e observações", obrigatorio: true },
      { tipo: "FOTO", rotulo: "Fotos da aplicação" },
      { tipo: "ASSINATURA", rotulo: "Assinatura do responsável" },
    ],
  },
  {
    slug: "limpeza",
    nome: "Limpeza profissional",
    segmento: "Limpeza",
    campos: [
      { tipo: "ESCOLHA", rotulo: "Tipo de limpeza", obrigatorio: true, opcoes: ["Pós-obra", "Comercial", "Residencial", "Caixa d'água", "Fachada"], noCabecalho: true },
      { tipo: "ESCOLHA", rotulo: "Ambientes atendidos", multipla: true, opcoes: ["Áreas comuns", "Banheiros", "Cozinha", "Escritórios", "Área externa", "Garagem"] },
      { tipo: "NUMERO", rotulo: "Equipe (nº de pessoas)" },
      { tipo: "SIM_NAO", rotulo: "Checklist de qualidade conferido", obrigatorio: true },
      { tipo: "TEXTO_LONGO", rotulo: "Observações do serviço" },
      { tipo: "FOTO", rotulo: "Fotos antes/depois" },
      { tipo: "ASSINATURA", rotulo: "Assinatura do cliente" },
    ],
  },
  {
    slug: "obra",
    nome: "Vistoria de obra",
    segmento: "Construção",
    campos: [
      { tipo: "TEXTO_CURTO", rotulo: "Etapa da obra", obrigatorio: true, noCabecalho: true },
      { tipo: "ESCOLHA", rotulo: "Situação da etapa", obrigatorio: true, opcoes: ["No prazo", "Adiantada", "Atrasada", "Parada"] },
      { tipo: "ESCOLHA", rotulo: "Itens vistoriados", multipla: true, opcoes: ["Estrutura", "Alvenaria", "Instalações elétricas", "Instalações hidráulicas", "Acabamento", "Segurança do canteiro"] },
      { tipo: "SIM_NAO", rotulo: "Não conformidade encontrada" },
      { tipo: "TEXTO_LONGO", rotulo: "Relatório da vistoria", obrigatorio: true },
      { tipo: "NUMERO", rotulo: "Avanço estimado da etapa (%)" },
      { tipo: "FOTO", rotulo: "Registro fotográfico" },
      { tipo: "ASSINATURA", rotulo: "Assinatura do responsável da obra" },
    ],
  },
];
