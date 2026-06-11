import React, { useState, useMemo } from 'react';
import { Concurso } from '../types';
import { Landmark, TrendingUp, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface FinanceDashboardProps {
  concursos: Concurso[];
}

export default function FinanceDashboard({ concursos }: FinanceDashboardProps) {
  const [hoveredData, setHoveredData] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  // Filter only paid fee entries
  const paidFees = useMemo(() => {
    return concursos.filter(c => c.statusTaxa === 'Paga');
  }, [concursos]);

  // Total amount spent on fees
  const totalSpent = useMemo(() => {
    return paidFees.reduce((sum, c) => sum + c.valorTaxa, 0);
  }, [paidFees]);

  // Pending fee amount
  const pendingFeesTotal = useMemo(() => {
    return concursos.filter(c => c.statusTaxa === 'Pendente').reduce((sum, c) => sum + c.valorTaxa, 0);
  }, [concursos]);

  // 1. Spending by Board (Banca)
  const spendingByBoard = useMemo(() => {
    const map: { [key: string]: number } = {};
    paidFees.forEach(c => {
      map[c.banca] = (map[c.banca] || 0) + c.valorTaxa;
    });
    return Object.entries(map)
      .map(([banca, total]) => ({ label: banca, value: total }))
      .sort((a, b) => b.value - a.value);
  }, [paidFees]);

  // 2. Spending by State (Estado)
  const spendingByState = useMemo(() => {
    const map: { [key: string]: number } = {};
    paidFees.forEach(c => {
      map[c.estado] = (map[c.estado] || 0) + c.valorTaxa;
    });
    return Object.entries(map)
      .map(([estado, total]) => ({ label: estado, value: total }))
      .sort((a, b) => b.value - a.value);
  }, [paidFees]);

  // 3. Spending by Year (Ano)
  const spendingByYear = useMemo(() => {
    const map: { [key: string]: number } = {};
    paidFees.forEach(c => {
      // Extract year from createdAt or dataProva
      const date = c.createdAt ? new Date(c.createdAt) : new Date();
      const year = isNaN(date.getFullYear()) ? '2026' : date.getFullYear().toString();
      map[year] = (map[year] || 0) + c.valorTaxa;
    });
    // Add default years if empty for visual beauty
    if (Object.keys(map).length === 0) {
      map['2025'] = 0;
      map['2026'] = 0;
    }
    return Object.entries(map)
      .map(([year, total]) => ({ label: year, value: total }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [paidFees]);

  // 4. Cumulative timeline of spent evolution
  const evolutionData = useMemo(() => {
    const sorted = [...paidFees].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let accumulated = 0;
    return sorted.map((c, idx) => {
      accumulated += c.valorTaxa;
      const formattedDate = c.createdAt 
        ? new Date(c.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) 
        : `Mês ${idx + 1}`;
      return {
        label: formattedDate,
        value: accumulated,
        itemValue: c.valorTaxa,
        orgao: c.orgao
      };
    });
  }, [paidFees]);

  // Values representing maximum bounds for charts rendering
  const maxYearValue = useMemo(() => {
    if (spendingByYear.length === 0) return 100;
    return Math.max(...spendingByYear.map(item => item.value), 100);
  }, [spendingByYear]);

  const maxEvolutionValue = useMemo(() => {
    if (evolutionData.length === 0) return 100;
    return Math.max(...evolutionData.map(item => item.value), 100);
  }, [evolutionData]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI: Gasto Total */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Investimento Total</span>
            <h3 className="text-xl font-bold font-mono text-slate-950 dark:text-white mt-0.5">
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-400">Total pago em taxas</span>
          </div>
        </div>

        {/* KPI: Contraste Pendente */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Pendências Atuais</span>
            <h3 className="text-xl font-bold font-mono text-slate-950 dark:text-white mt-0.5">
              R$ {pendingFeesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-400">Taxas pendentes</span>
          </div>
        </div>

        {/* KPI: Custo Médio Inscrição */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Custo Médio</span>
            <h3 className="text-xl font-bold font-mono text-slate-950 dark:text-white mt-0.5">
              R$ {(paidFees.length > 0 ? totalSpent / paidFees.length : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-400">Por taxa paga</span>
          </div>
        </div>

        {/* KPI: Quantidade de Taxas */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase font-bold">Taxas Controladas</span>
            <h3 className="text-xl font-bold font-mono text-slate-950 dark:text-white mt-0.5">
              {paidFees.length + concursos.filter(c => c.statusTaxa === 'Pendente').length}
            </h3>
            <span className="text-[10px] text-slate-400">Total: {paidFees.length} pagas • {concursos.filter(c => c.statusTaxa === 'Pendente').length} pendentes</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Evolution timeline (Linear progression) */}
        <div className="col-span-1 lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Evolução do Investimento</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Acompanhamento acumulado dos gastos com taxas de inscrição ao longo dos meses</p>

          {evolutionData.length > 0 ? (
            <div className="relative w-full h-64 mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 20 + ratio * 140;
                  const labelVal = maxEvolutionValue - ratio * maxEvolutionValue;
                  return (
                    <g key={i}>
                      <line x1="40" y1={y} x2="480" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" strokeDasharray="3 3" />
                      <text x="5" y={y + 4} className="text-[9px] font-mono fill-slate-400 font-bold">R${Math.round(labelVal)}</text>
                    </g>
                  );
                })}

                {/* Plot the line path and the fill under the line */}
                {(() => {
                  const paddingLeft = 60;
                  const paddingRight = 460;
                  const stepX = (paddingRight - paddingLeft) / Math.max(evolutionData.length - 1, 1);
                  
                  let dLine = '';
                  let dArea = `M ${paddingLeft} 160 `;

                  evolutionData.forEach((item, index) => {
                    const x = paddingLeft + index * stepX;
                    const y = 160 - (item.value / maxEvolutionValue) * 130;
                    
                    if (index === 0) {
                      dLine += `M ${x} ${y} `;
                    } else {
                      dLine += `L ${x} ${y} `;
                    }
                    dArea += `L ${x} ${y} `;
                  });

                  const endX = paddingLeft + (evolutionData.length - 1) * stepX;
                  dArea += `L ${endX} 160 Z`;

                  return (
                    <>
                      {/* Area Fill */}
                      <path d={dArea} fill="url(#areaGrad)" />
                      {/* Smooth Progression Line */}
                      <path d={dLine} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Checkpoint Dots */}
                      {evolutionData.map((item, index) => {
                        const x = paddingLeft + index * stepX;
                        const y = 160 - (item.value / maxEvolutionValue) * 130;
                        return (
                          <g key={index} className="group/dot cursor-pointer">
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 stroke-2 hover:r-6"
                              onMouseEnter={(e) => setHoveredData({
                                label: `${item.orgao} (+R$ ${item.itemValue.toFixed(2)})`,
                                value: item.value,
                                x: x,
                                y: y
                              })}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                            {/* Horizontal date anchors */}
                            <text x={x} y="185" textAnchor="middle" className="text-[9px] text-slate-400 dark:text-slate-500 fill-slate-400 select-none">
                              {item.label}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* Floating Tooltip inside evolution chart */}
              {hoveredData && (
                <div
                  className="absolute bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-md text-xs pointer-events-none"
                  style={{
                    left: `${Math.min(hoveredData.x, 340)}px`,
                    top: `${Math.max(hoveredData.y - 70, 0)}px`,
                  }}
                >
                  <p className="font-semibold text-slate-300">{hoveredData.label}</p>
                  <p className="text-indigo-400 font-mono mt-0.5">Acumulado: R$ {hoveredData.value.toFixed(2)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-xs text-slate-500 font-mono">Sem dados financeiros de taxas pagas cadastrados</span>
            </div>
          )}
        </div>

        {/* Chart 2: Spend by Year (Interactive bar chart) */}
        <div className="col-span-1 lg:col-span-4 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Gasto por Ano</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Investimento agregado anual</p>
          </div>

          <div className="space-y-4 my-2">
            {spendingByYear.map((item, index) => {
              const pct = (item.value / maxYearValue) * 100;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/70 text-center mt-3">
            <span className="text-[10px] text-slate-400 block font-mono">ANO ATUAL (2026)</span>
            <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
              R$ {(spendingByYear.find(i => i.label === '2026')?.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Spend by Board and State rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Segment: Spend by Board (Banca) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Gasto por Banca</h3>
            <span className="text-[10px] font-mono bg-slate-150 dark:bg-slate-800 px-2 py-1 rounded-sm text-slate-500 dark:text-slate-400 uppercase">Ranking</span>
          </div>

          {spendingByBoard.length > 0 ? (
            <div className="space-y-3.5">
              {spendingByBoard.map((item, idx) => {
                const totalSpentBoard = spendingByBoard.reduce((s, o) => s + o.value, 0);
                const percentVal = totalSpentBoard > 0 ? (item.value / totalSpentBoard) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 font-mono text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{percentVal.toFixed(1)}% do orçamento</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-950 dark:text-slate-100">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Nenhum investimento registrado ainda.</p>
          )}
        </div>

        {/* Segment: Spend by State (Estado) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Gasto por Estado</h3>
            <span className="text-[10px] font-mono bg-slate-150 dark:bg-slate-800 px-2 py-1 rounded-sm text-slate-500 dark:text-slate-400 uppercase">Geopolítico</span>
          </div>

          {spendingByState.length > 0 ? (
            <div className="space-y-3.5">
              {spendingByState.map((item, idx) => {
                const totalSpentState = spendingByState.reduce((s, o) => s + o.value, 0);
                const percentStateVal = totalSpentState > 0 ? (item.value / totalSpentState) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 font-bold text-xs text-teal-800 dark:text-teal-400 flex items-center justify-center">
                        {item.label}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">UF: {item.label}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{percentStateVal.toFixed(1)}% do orçamento</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-950 dark:text-slate-100">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Nenhum investimento registrado por estado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
