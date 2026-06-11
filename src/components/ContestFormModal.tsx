import React, { useState, useEffect } from 'react';
import { Concurso, StatusConcurso, StatusTaxa } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';
import { ESTADOS } from '../data';

interface ContestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (concurso: Concurso) => void;
  concursoToEdit?: Concurso | null; // If editing, pass it here
}

export default function ContestFormModal({ isOpen, onClose, onSave, concursoToEdit }: ContestFormModalProps) {
  const [orgao, setOrgao] = useState('');
  const [cargo, setCargo] = useState('');
  const [banca, setBanca] = useState('');
  const [estado, setEstado] = useState('SP');
  const [cidadeProva, setCidadeProva] = useState('');
  const [salario, setSalario] = useState('');
  const [vagas, setVagas] = useState('');
  const [linkEdital, setLinkEdital] = useState('');
  const [dataInscricaoAbertura, setDataInscricaoAbertura] = useState('');
  const [dataInscricaoFechamento, setDataInscricaoFechamento] = useState('');
  const [dataPagamentoVencimento, setDataPagamentoVencimento] = useState('');
  const [valorTaxa, setValorTaxa] = useState('');
  const [statusTaxa, setStatusTaxa] = useState<StatusTaxa>('Pendente');
  const [dataProva, setDataProva] = useState('');
  const [dataResultado, setDataResultado] = useState('');
  const [status, setStatus] = useState<StatusConcurso>('Interesse');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load values if we're in edit mode
  useEffect(() => {
    if (concursoToEdit) {
      setOrgao(concursoToEdit.orgao);
      setCargo(concursoToEdit.cargo);
      setBanca(concursoToEdit.banca);
      setEstado(concursoToEdit.estado);
      setCidadeProva(concursoToEdit.cidadeProva);
      setSalario(concursoToEdit.salario.toString());
      setVagas(concursoToEdit.vagas.toString());
      setLinkEdital(concursoToEdit.linkEdital);
      setDataInscricaoAbertura(concursoToEdit.dataInscricaoAbertura);
      setDataInscricaoFechamento(concursoToEdit.dataInscricaoFechamento);
      setDataPagamentoVencimento(concursoToEdit.dataPagamentoVencimento);
      setValorTaxa(concursoToEdit.valorTaxa.toString());
      setStatusTaxa(concursoToEdit.statusTaxa);
      setDataProva(concursoToEdit.dataProva);
      setDataResultado(concursoToEdit.dataResultado);
      setStatus(concursoToEdit.status);
      setObservacoes(concursoToEdit.observacoes);
    } else {
      // Clear forms
      setOrgao('');
      setCargo('');
      setBanca('');
      setEstado('SP');
      setCidadeProva('');
      setSalario('');
      setVagas('');
      setLinkEdital('');
      setDataInscricaoAbertura('');
      setDataInscricaoFechamento('');
      setDataPagamentoVencimento('');
      setValorTaxa('');
      setStatusTaxa('Pendente');
      setDataProva('');
      setDataResultado('');
      setStatus('Interesse');
      setObservacoes('');
    }
    setError(null);
  }, [concursoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgao || !cargo || !banca || !cidadeProva || !salario || !vagas || !dataProva) {
      setError('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    const parseSalario = parseFloat(salario);
    const parseVagas = parseInt(vagas, 10);
    const parseValorTaxa = parseFloat(valorTaxa) || 0;

    if (isNaN(parseSalario) || parseSalario <= 0) {
      setError('Insira um valor numérico de salário válido');
      return;
    }

    if (isNaN(parseVagas) || parseVagas < 0) {
      setError('Insira um número de vagas válido');
      return;
    }

    const payload: Concurso = {
      id: concursoToEdit?.id || Date.now().toString(),
      orgao,
      cargo,
      banca,
      estado,
      cidadeProva,
      salario: parseSalario,
      vagas: parseVagas,
      linkEdital,
      dataInscricaoAbertura: dataInscricaoAbertura || '2026-06-01',
      dataInscricaoFechamento: dataInscricaoFechamento || '2026-07-01',
      dataPagamentoVencimento: dataPagamentoVencimento || '2026-07-02',
      valorTaxa: parseValorTaxa,
      statusTaxa,
      dataProva,
      dataResultado: dataResultado || '2026-08-30',
      status,
      observacoes,
      createdAt: concursoToEdit?.createdAt || new Date().toISOString()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overscroll-y-contain overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header Dialog */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-slate-50">
              {concursoToEdit ? 'Editar Detalhes do Concurso' : 'Cadastrar Novo Concurso'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Defina os prazos, valores, cargos e link de acompanhamento</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg border border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 select-text">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-950/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Órgão Solicitante / Entidade *</label>
              <input
                type="text"
                placeholder="Ex. TRT 2ª Região, BB, Receita Federal"
                value={orgao}
                onChange={(e) => setOrgao(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Cargo Pretendido *</label>
              <input
                type="text"
                placeholder="Ex. Técnico Judiciário, Escriturário, Analista"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Banca Examinadora *</label>
              <input
                type="text"
                placeholder="Ex. FCC, FGV, Cebraspe"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Estado (UF)</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Cidade de Realização da Prova *</label>
              <input
                type="text"
                placeholder="Ex. Campinas, São Paulo, Rio"
                value={cidadeProva}
                onChange={(e) => setCidadeProva(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Finance & Vacancies */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Salário Mensal (R$) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="8529.67"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Quantidade de Vagas *</label>
              <input
                type="number"
                placeholder="10"
                value={vagas}
                onChange={(e) => setVagas(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Custo da Taxa (R$)</label>
              <input
                type="number"
                placeholder="Ex. 85.00"
                value={valorTaxa}
                onChange={(e) => setValorTaxa(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Estado da Taxa</label>
              <select
                value={statusTaxa}
                onChange={(e) => setStatusTaxa(e.target.value as StatusTaxa)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Pendente">Pendente</option>
                <option value="Paga">Paga</option>
                <option value="Isenta">Isenta</option>
              </select>
            </div>
          </div>

          {/* Dates Center */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Cronograma e Prazos do Edital</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase">Início Inspecções</label>
                <input
                  type="date"
                  value={dataInscricaoAbertura}
                  onChange={(e) => setDataInscricaoAbertura(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase">Fim Inscrições</label>
                <input
                  type="date"
                  value={dataInscricaoFechamento}
                  onChange={(e) => setDataInscricaoFechamento(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase">Vencimento Taxa</label>
                <input
                  type="date"
                  value={dataPagamentoVencimento}
                  onChange={(e) => setDataPagamentoVencimento(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase">Dia da Prova *</label>
                <input
                  type="date"
                  value={dataProva}
                  onChange={(e) => setDataProva(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Data Gabarito / Resultados</label>
                <input
                  type="date"
                  value={dataResultado}
                  onChange={(e) => setDataResultado(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase font-bold text-indigo-650">Link do Edital Completo</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/edital"
                  value={linkEdital}
                  onChange={(e) => setLinkEdital(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Status & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold font-mono text-slate-650 dark:text-slate-400 uppercase">Status de Preparo / Trajetória</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusConcurso)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-indigo-900 dark:text-indigo-400 focus:outline-hidden font-semibold"
              >
                <option value="Interesse">Interesse</option>
                <option value="Inscrição Aberta">Inscrição Aberta</option>
                <option value="Inscrito">Inscrito</option>
                <option value="Taxa Pendente">Taxa Pendente</option>
                <option value="Taxa Paga">Taxa Paga</option>
                <option value="Aguardando Prova">Aguardando Prova</option>
                <option value="Prova Realizada">Prova Realizada</option>
                <option value="Resultado Publicado">Resultado Publicado</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Cadastro Reserva">Cadastro Reserva</option>
              </select>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="block text-[11px] font-bold font-mono text-slate-650 dark:text-slate-400 uppercase">Observações / Plano de Estudos</label>
              <input
                type="text"
                placeholder="Ex. Revisar legislação, focar em redação."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Save panel */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl transition text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Salvar Concurso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
