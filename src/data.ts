import { Concurso, Alerta } from './types';

// Anchor date is June 10, 2026 (based on meta context)
export const ANCHOR_DATE = '2026-06-10';

export const INITIAL_CONCURSOS: Concurso[] = [
  {
    id: '1',
    orgao: 'TRT 2ª Região',
    cargo: 'Técnico Judiciário (TI)',
    banca: 'FCC',
    estado: 'SP',
    cidadeProva: 'São Paulo',
    salario: 8529.67,
    vagas: 12,
    linkEdital: 'https://ww2.trt2.jus.br/concursos',
    dataInscricaoAbertura: '2026-04-10',
    dataInscricaoFechamento: '2026-05-15',
    dataPagamentoVencimento: '2026-05-16',
    valorTaxa: 85.00,
    statusTaxa: 'Paga',
    dataProva: '2026-06-25', // 15 days from June 10
    dataResultado: '2026-07-30',
    status: 'Aguardando Prova',
    observacoes: 'Focar em Direito do Trabalho e Engenharia de Software. Estudar regimento interno.',
    createdAt: '2026-04-11T10:00:00Z'
  },
  {
    id: '2',
    orgao: 'Banco do Brasil',
    cargo: 'Agente de Tecnologia (Escriturário)',
    banca: 'CESGRANRIO',
    estado: 'RJ',
    cidadeProva: 'Rio de Janeiro',
    salario: 5430.00,
    vagas: 150,
    linkEdital: 'https://www.cesgranrio.org.br',
    dataInscricaoAbertura: '2026-05-01',
    dataInscricaoFechamento: '2026-06-12', // 2 days from June 10
    dataPagamentoVencimento: '2026-06-13', // 3 days from June 10
    valorTaxa: 50.00,
    statusTaxa: 'Pendente',
    dataProva: '2026-07-10', // exactly 30 days from June 10 (2026-06-10 + 30d ~ July 10)
    dataResultado: '2026-08-20',
    status: 'Inscrito',
    observacoes: 'Excelente oportunidade. Concurso em nível nacional. Prova em julho.',
    createdAt: '2026-05-05T14:30:00Z'
  },
  {
    id: '3',
    orgao: 'Secretaria da Fazenda (SEFAZ SP)',
    cargo: 'Auditor Fiscal da Receita Estadual',
    banca: 'FGV',
    estado: 'SP',
    cidadeProva: 'Campinas',
    salario: 24732.00,
    vagas: 40,
    linkEdital: 'https://conhecimento.fgv.br/concursos',
    dataInscricaoAbertura: '2026-03-01',
    dataInscricaoFechamento: '2026-04-05',
    dataPagamentoVencimento: '2026-04-06',
    valorTaxa: 190.00,
    statusTaxa: 'Paga',
    dataProva: '2026-06-13', // 3 days from June 10
    dataResultado: '2026-08-01',
    status: 'Taxa Paga',
    observacoes: 'Prova muito difícil. Foque em Contabilidade Avançada, Legislação Tributária de SP e Auditoria.',
    createdAt: '2026-03-02T11:20:00Z'
  },
  {
    id: '4',
    orgao: 'TSE Unificado',
    cargo: 'Analista Judiciário - Área Administrativa',
    banca: 'Cebraspe',
    estado: 'DF',
    cidadeProva: 'Brasília',
    salario: 13994.78,
    vagas: 18,
    linkEdital: 'https://www.cebraspe.org.br/concursos',
    dataInscricaoAbertura: '2026-06-01',
    dataInscricaoFechamento: '2026-07-05',
    dataPagamentoVencimento: '2026-07-06',
    valorTaxa: 130.00,
    statusTaxa: 'Pendente',
    dataProva: '2026-08-16',
    dataResultado: '2026-09-30',
    status: 'Taxa Pendente',
    observacoes: 'Ainda preciso decidir se farei a prova em Brasília ou em outro polo regional. Vencimento da inscrição em julho.',
    createdAt: '2026-06-02T09:00:00Z'
  },
  {
    id: '5',
    orgao: 'Petrobras',
    cargo: 'Engenheiro de Equipamentos',
    banca: 'CESGRANRIO',
    estado: 'BA',
    cidadeProva: 'Salvador',
    salario: 14200.00,
    vagas: 5,
    linkEdital: 'https://www.cesgranrio.org.br',
    dataInscricaoAbertura: '2025-10-10',
    dataInscricaoFechamento: '2025-11-15',
    dataPagamentoVencimento: '2025-11-16',
    valorTaxa: 110.00,
    statusTaxa: 'Paga',
    dataProva: '2026-01-18', // Past
    dataResultado: '2026-03-05',
    status: 'Resultado Publicado',
    observacoes: 'Fiquei classificado na posição 21. Esperar o cadastro de reserva se movimentar.',
    createdAt: '2025-10-15T15:45:00Z'
  },
  {
    id: '6',
    orgao: 'ANATEL',
    cargo: 'Especialista em Regulação de Serviços de Telecomunicações',
    banca: 'Cebraspe',
    estado: 'DF',
    cidadeProva: 'Brasília',
    salario: 16413.35,
    vagas: 2,
    linkEdital: 'https://www.cebraspe.org.br/concursos',
    dataInscricaoAbertura: '2025-08-01',
    dataInscricaoFechamento: '2025-09-02',
    dataPagamentoVencimento: '2025-09-03',
    valorTaxa: 160.00,
    statusTaxa: 'Paga',
    dataProva: '2025-11-30', // Past
    dataResultado: '2026-01-15',
    status: 'Aprovado',
    observacoes: 'APROVADO! Documentação pronta para a posse em julho de 2026.',
    createdAt: '2025-08-10T11:00:00Z'
  },
  {
    id: '7',
    orgao: 'TJMG (Tribunal de Justiça de MG)',
    cargo: 'Oficial de Apoio Judicial',
    banca: 'MSCONCURSOS',
    estado: 'MG',
    cidadeProva: 'Belo Horizonte',
    salario: 4210.50,
    vagas: 25,
    linkEdital: 'https://www.msconcursos.com.br',
    dataInscricaoAbertura: '2026-05-10',
    dataInscricaoFechamento: '2026-06-10', // TODAY! (Último dia de inscrição)
    dataPagamentoVencimento: '2026-06-11', // Tomorrow (Último dia para pgto)
    valorTaxa: 60.00,
    statusTaxa: 'Pendente',
    dataProva: '2026-07-26',
    dataResultado: '2026-09-05',
    status: 'Interesse',
    observacoes: 'Interessante para se manter ativo no estado de Minas.',
    createdAt: '2026-05-15T08:15:00Z'
  }
];

// Helper to calculate days diff
export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Function to generate alerts for a given list of concursos
export function generateAlerts(concursos: Concurso[], anchorDateStr: string = ANCHOR_DATE): Alerta[] {
  const alerts: Alerta[] = [];
  const anchorDate = new Date(anchorDateStr);
  
  concursos.forEach((c) => {
    // 1. Check Date of Exam
    const daysToExam = getDaysDiff(c.dataProva, anchorDateStr);
    
    // Valid for active types of status
    const isActive = !['Resultado Publicado', 'Aprovado', 'Cadastro Reserva', 'Prova Realizada'].includes(c.status);
    
    if (isActive && daysToExam > 0) {
      if (daysToExam === 30) {
        alerts.push({
          id: `${c.id}-prova-30`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova_30',
          mensagem: `Faltam exatos 30 dias para a prova do concurso ${c.orgao} (${c.cidadeProva}). Hora de intensificar revisões!`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'info'
        });
      } else if (daysToExam === 15) {
        alerts.push({
          id: `${c.id}-prova-15`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova_15',
          mensagem: `ATENÇÃO: Faltam apenas 15 dias para a prova do concurso ${c.orgao} no dia ${formatBRLDate(c.dataProva)}!`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'warning'
        });
      } else if (daysToExam === 7) {
        alerts.push({
          id: `${c.id}-prova-7`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova_7',
          mensagem: `CONTAGEM REGRESSIVA: A prova do concurso ${c.orgao} é em 7 dias! Revise seus resumos.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'warning'
        });
      } else if (daysToExam === 3) {
        alerts.push({
          id: `${c.id}-prova-3`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova_3',
          mensagem: `ALERTA URGENTE: Faltam 3 dias para a prova do ${c.orgao}! Prepare sua caneta preta e local de prova.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'danger'
        });
      } else if (daysToExam > 0 && daysToExam < 3) {
        alerts.push({
          id: `${c.id}-prova-imminent`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova_3',
          mensagem: `A prova do concurso ${c.orgao} é em ${daysToExam} dia(s) (${formatBRLDate(c.dataProva)})! Foco total.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'danger'
        });
      }
    }

    // 2. Check Last day of payment
    const daysToPayment = getDaysDiff(c.dataPagamentoVencimento, anchorDateStr);
    if (c.statusTaxa === 'Pendente' && daysToPayment >= 0) {
      if (daysToPayment === 0) {
        alerts.push({
          id: `${c.id}-taxa-hoje`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'vencimento_taxa',
          mensagem: `CRÍTICO: Hoje é o ÚLTIMO DIA para pagamento da taxa de R$ ${c.valorTaxa.toFixed(2)} do ${c.orgao}!`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'danger'
        });
      } else if (daysToPayment === 1) {
        alerts.push({
          id: `${c.id}-taxa-amanha`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'vencimento_taxa',
          mensagem: `Atenção: Amanhã (${formatBRLDate(c.dataPagamentoVencimento)}) vence a taxa de inscrição do concurso ${c.orgao}.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'warning'
        });
      } else if (daysToPayment > 1 && daysToPayment <= 3) {
        alerts.push({
          id: `${c.id}-taxa-vencendo`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'vencimento_taxa',
          mensagem: `A taxa do concurso ${c.orgao} vence em ${daysToPayment} dias (${formatBRLDate(c.dataPagamentoVencimento)}). Não esqueça de pagar!`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'info'
        });
      }
    }

    // 3. Check Last day of registration
    const daysToRegClose = getDaysDiff(c.dataInscricaoFechamento, anchorDateStr);
    if (['Interesse', 'Inscrição Aberta'].includes(c.status) && daysToRegClose >= 0) {
      if (daysToRegClose === 0) {
        alerts.push({
          id: `${c.id}-inscricao-hoje`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'ultimo_dia_inscricao',
          mensagem: `ATENÇÃO: Hoje encerram-se as inscrições para o concurso ${c.orgao}! Inscreva-se já.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'danger'
        });
      } else if (daysToRegClose === 1) {
        alerts.push({
          id: `${c.id}-inscricao-amanha`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'ultimo_dia_inscricao',
          mensagem: `As inscrições para o concurso ${c.orgao} encerram amanhã, dia ${formatBRLDate(c.dataInscricaoFechamento)}.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'warning'
        });
      } else if (daysToRegClose > 1 && daysToRegClose <= 3) {
        alerts.push({
          id: `${c.id}-inscricao-encerrando`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'ultimo_dia_inscricao',
          mensagem: `O período de inscrições para o concurso ${c.orgao} encerra em ${daysToRegClose} dias.`,
          dataAlerta: anchorDateStr,
          lido: false,
          gravidade: 'info'
        });
      }
    }
  });

  return alerts;
}

// Helper to format Date into DD/MM/YYYY
export function formatBRLDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Portuguese text mapping for contest statuses to display beautiful tags
export const STATUS_DATA = {
  'Interesse': { label: 'Interesse', bg: 'bg-cool-gray-100 dark:bg-zinc-800 text-cool-gray-700 dark:text-zinc-300 border-cool-gray-200 dark:border-zinc-700' },
  'Inscrição Aberta': { label: 'Inscrição Aberta', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-150 dark:border-emerald-900/30' },
  'Inscrito': { label: 'Inscrito', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-150 dark:border-sky-900/30' },
  'Taxa Pendente': { label: 'Taxa Pendente', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-150 dark:border-rose-900/20' },
  'Taxa Paga': { label: 'Taxa Paga', bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/20' },
  'Aguardando Prova': { label: 'Aguardando Prova', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-150 dark:border-amber-900/20' },
  'Prova Realizada': { label: 'Prova Realizada', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-150 dark:border-teal-900/20' },
  'Resultado Publicado': { label: 'Resultado Publicado', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-150 dark:border-fuchsia-900/20' },
  'Aprovado': { label: 'Aprovado 🎉', bg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  'Cadastro Reserva': { label: 'Cadastro Reserva', bg: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40' }
};

export const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'Unificado'
];

export const BANCA_LINKS: Record<string, string> = {
  'FGV': 'https://conhecimento.fgv.br/concursos',
  'FCC': 'https://www.concursosfcc.com.br',
  'Cebraspe': 'https://www.cebraspe.org.br/concursos',
  'CESPE': 'https://www.cebraspe.org.br/concursos',
  'Cesgranrio': 'https://www.cesgranrio.org.br',
  'Vunesp': 'https://www.vunesp.com.br',
  'IBFC': 'https://www.ibfc.org.br',
  'Idecan': 'https://www.idecan.org.br',
  'AOCP': 'https://www.institutoaocp.org.br',
  'Instituto AOCP': 'https://www.institutoaocp.org.br',
  'Faurgs': 'https://portalfaurgs.com.br/concursos',
  'Fundatec': 'https://www.fundatec.org.br',
  'Consulplan': 'https://www.consulplan.net',
  'Quadrix': 'https://www.quadrix.org.br',
};

export function getBancaLink(bancaName: string): string | null {
  if (!bancaName) return null;
  const nameUpper = bancaName.toUpperCase().trim();
  for (const [key, val] of Object.entries(BANCA_LINKS)) {
    if (nameUpper.includes(key.toUpperCase())) {
      return val;
    }
  }
  return null;
}

