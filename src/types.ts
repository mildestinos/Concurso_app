export type StatusConcurso =
  | 'Interesse'
  | 'Inscrição Aberta'
  | 'Inscrito'
  | 'Taxa Pendente'
  | 'Taxa Paga'
  | 'Aguardando Prova'
  | 'Prova Realizada'
  | 'Resultado Publicado'
  | 'Aprovado'
  | 'Cadastro Reserva';

export type StatusTaxa = 'Paga' | 'Pendente' | 'Isenta';

export interface Concurso {
  id: string;
  orgao: string;
  cargo: string;
  banca: string;
  estado: string; // SP, RJ, etc.
  cidadeProva: string;
  salario: number;
  vagas: number;
  linkEdital: string;
  dataInscricaoAbertura: string; // YYYY-MM-DD
  dataInscricaoFechamento: string; // YYYY-MM-DD
  dataPagamentoVencimento: string; // YYYY-MM-DD
  valorTaxa: number;
  statusTaxa: StatusTaxa;
  dataProva: string; // YYYY-MM-DD
  dataResultado: string; // YYYY-MM-DD
  observacoes: string;
  status: StatusConcurso;
  createdAt: string;
}

export interface Alerta {
  id: string;
  concursoId: string;
  concursoTitle: string; // orgao - cargo
  tipo: 'prova_30' | 'prova_15' | 'prova_7' | 'prova_3' | 'vencimento_taxa' | 'ultimo_dia_inscricao';
  mensagem: string;
  dataAlerta: string; // YYYY-MM-DD
  lido: boolean;
  gravidade: 'info' | 'warning' | 'danger';
}
