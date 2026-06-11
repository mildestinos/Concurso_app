import React, { useState } from 'react';
import { Concurso } from '../types';
import { FileText, Download, Printer, CheckCircle, Brain, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { formatBRLDate } from '../data';

interface ReportsPanelProps {
  concursos: Concurso[];
}

export default function ReportsPanel({ concursos }: ReportsPanelProps) {
  const [activeReport, setActiveReport] = useState<'inscritos' | 'provas' | 'gastos' | null>(null);

  // Filter 1: Inscritos
  const listInscritos = concursos.filter(c => 
    ['Inscrito', 'Taxa Pendente', 'Taxa Paga', 'Aguardando Prova', 'Prova Realizada', 'Aprovado', 'Cadastro Reserva'].includes(c.status)
  );

  // Filter 2: Provas Futuras (Exam date >= anchor 10 June 2026 and status not terminal)
  const listProvasFuturas = concursos.filter(c => {
    const isFuture = new Date(c.dataProva).getTime() >= new Date('2026-06-10').getTime();
    const isCompleted = ['Resultado Publicado', 'Aprovado', 'Cadastro Reserva', 'Prova Realizada'].includes(c.status);
    return isFuture && !isCompleted;
  });

  // Filter 3: Gastos com Taxas (Tax status = Paga or Pendente)
  const listGastos = concursos.filter(c => c.valorTaxa > 0);

  // Export fully compliant Excel/CSV content
  const handleExportExcel = () => {
    // Column Headers
    const headers = [
      'Órgão', 'Cargo', 'Banca', 'Estado', 'Cidade da Prova', 'Salário', 
      'Vagas', 'Link Edital', 'Dt Abertura Inscrição', 'Dt Fechamento Inscrição', 
      'Vcto Taxa', 'Valor Taxa', 'Status Taxa', 'Data Prova', 'Status do Concurso'
    ];

    // Map rows
    const rows = concursos.map(c => [
      c.orgao.replace(/,/g, ';'),
      c.cargo.replace(/,/g, ';'),
      c.banca,
      c.estado,
      c.cidadeProva.replace(/,/g, ';'),
      c.salario.toFixed(2),
      c.vagas,
      c.linkEdital,
      c.dataInscricaoAbertura,
      c.dataInscricaoFechamento,
      c.dataPagamentoVencimento,
      c.valorTaxa.toFixed(2),
      c.statusTaxa,
      c.dataProva,
      c.status
    ]);

    // Build CSV with UTF-8 BOM so Excel decodes accents
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'radar_concursos_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser standard print command
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 tracking-tight">Central de Relatórios & Exportação</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gere layouts prontos para impressão física, salve como PDF ou exporte os dados cadastrados para planilhas eletrônicas.
        </p>

        {/* Buttons board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <button
            onClick={() => setActiveReport('inscritos')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer ${
              activeReport === 'inscritos'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20'
                : 'border-slate-150 dark:border-slate-800'
            }`}
          >
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Concursos Inscritos</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{listInscritos.length} registros selecionados</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('provas')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer ${
              activeReport === 'provas'
                ? 'border-rose-600 dark:border-rose-500 bg-rose-50/20'
                : 'border-slate-150 dark:border-slate-800'
            }`}
          >
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl w-fit">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Provas Futuras</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{listProvasFuturas.length} com cronograma ativo</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('gastos')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer ${
              activeReport === 'gastos'
                ? 'border-teal-600 dark:border-teal-400 bg-teal-50/20'
                : 'border-slate-150 dark:border-slate-800'
            }`}
          >
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl w-fit">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Gastos com Taxas</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Visão financeira de inscrições</span>
            </div>
          </button>

          <button
            onClick={handleExportExcel}
            className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-emerald-500/10 dark:bg-emerald-900/10 text-left flex flex-col justify-between h-32 hover:bg-emerald-500/15 transition cursor-pointer"
          >
            <div className="p-2 bg-emerald-500 text-white rounded-xl w-fit">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Exportar para Excel</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Download imediato de planilha .csv</span>
            </div>
          </button>
        </div>
      </div>

      {/* Render selected printable / preview frame */}
      {activeReport ? (
        <div id="printableArea" className="p-8 bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-xs printable-element">
          
          {/* Header Printable block */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold font-sans flex items-center gap-2 text-indigo-950">
                <Brain className="h-6 w-6 text-indigo-600" />
                Radar Concursos - Relatório Oficial
              </h2>
              <p className="text-xs text-slate-500 mt-1">Gerado eletronicamente em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md uppercase font-extrabold">
                {activeReport === 'inscritos' ? 'Concursos Inscritos' : activeReport === 'provas' ? 'Provas Agendadas' : 'Gastos Detalhados'}
              </span>
            </div>
          </div>

          {/* Table contents */}
          {activeReport === 'inscritos' && (
            <div>
              <p className="text-xs text-slate-600 mb-4 font-mono">
                Relação dos concursos com inscrições finalizadas ou em andamento sob controle do candidato.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3">Órgão</th>
                      <th className="p-3">Cargo</th>
                      <th className="p-3">Banca</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Salário</th>
                      <th className="p-3">Data Prova</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listInscritos.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-950">{c.orgao}</td>
                        <td className="p-3">{c.cargo}</td>
                        <td className="p-3">{c.banca}</td>
                        <td className="p-3">{c.estado}</td>
                        <td className="p-3 text-right font-mono">R$ {c.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 font-mono">{formatBRLDate(c.dataProva)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-neutral-100 border text-neutral-800">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {listInscritos.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-slate-450 font-mono">Sem dados para exibição</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'provas' && (
            <div>
              <p className="text-xs text-slate-600 mb-4 font-mono">
                Relação cronológica de avaliações, certames e provas de concursos futuros.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3">Data Prova</th>
                      <th className="p-3">Órgão / Cargo</th>
                      <th className="p-3">Banca</th>
                      <th className="p-3">UF / Cidade</th>
                      <th className="p-3">Link Edital</th>
                      <th className="p-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listProvasFuturas.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-bold font-mono text-indigo-750">{formatBRLDate(c.dataProva)}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-950">{c.orgao}</div>
                          <div className="text-[10px] text-slate-500">{c.cargo}</div>
                        </td>
                        <td className="p-3 font-mono">{c.banca}</td>
                        <td className="p-3">{c.estado} - {c.cidadeProva}</td>
                        <td className="p-3 font-mono text-indigo-600 truncate max-w-36">{c.linkEdital || '-'}</td>
                        <td className="p-3 text-slate-500 italic max-w-48 truncate">{c.observacoes || '-'}</td>
                      </tr>
                    ))}
                    {listProvasFuturas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-450 font-mono">Sem provas marcadas no horizonte</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'gastos' && (
            <div>
              <p className="text-xs text-slate-600 mb-4 font-mono">
                Sumário detalhado do desembolso em taxas de participação e taxas de inscrição.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3">Órgão / Cargo</th>
                      <th className="p-3">Banca</th>
                      <th className="p-3">Vencimento Taxa</th>
                      <th className="p-3">Status Boleta</th>
                      <th className="p-3 text-right">Valor Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listGastos.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-semibold text-slate-950">{c.orgao}</div>
                          <div className="text-[10px] text-slate-400">{c.cargo}</div>
                        </td>
                        <td className="p-3">{c.banca}</td>
                        <td className="p-3 font-mono">{formatBRLDate(c.dataPagamentoVencimento)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            c.statusTaxa === 'Paga' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.statusTaxa}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold font-mono">R$ {c.valorTaxa.toFixed(2)}</td>
                      </tr>
                    ))}
                    {listGastos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-450 font-mono">Nenhum gasto financeiro de taxas cadastrado</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 text-sm">
                      <td colSpan={4} className="p-4 text-right text-slate-700 text-xs font-mono uppercase">Total Acumulado Gasto:</td>
                      <td className="p-4 text-right text-indigo-950 font-mono">
                        R$ {concursos.filter(c => c.statusTaxa === 'Paga').reduce((s,o) => s + o.valorTaxa, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Print trigger and instructions */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 no-print">
            <span className="text-xs text-slate-450 flex items-center gap-1">
              💡 Para salvar como PDF, selecione "Salvar como PDF" como impressora de destino.
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-xs font-semibold cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Impressão Física / Salvar como PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-100 dark:border-slate-850 rounded-3xl">
          <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-650 dark:text-slate-300">Escolha um Modelo de Relatório</h4>
          <p className="text-xs text-slate-400 max-w-(--size-xs) mx-auto mt-1 leading-normal">
            Selecione uma das opções acima para renderizar os dados formatados em folha timbrada oficial da aplicação e gerar o PDF necessário.
          </p>
        </div>
      )}
    </div>
  );
}
