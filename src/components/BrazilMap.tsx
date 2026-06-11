import React, { useState } from 'react';
import { Concurso } from '../types';
import { MapPin, ArrowRight, Award } from 'lucide-react';

interface BrazilMapProps {
  concursos: Concurso[];
  onSelectEstado: (estado: string | null) => void;
  selectedEstado: string | null;
}

// Coordinate coordinates of Brazil states simplified in a grid/honeycomb/artistic layout
// to provide a pristine, 100% stable, fully responsive, and visually modern representation of states
// without requiring a 500KB heavy direct GIS file which often breaks in iframes.
// We align them in a beautifully styled, high-end "Hex/Bento State Selector Grid" that is mapped inside an SVG
// combined with a clean geographic hover dashboard.

const ESTADO_COORDINATES: { [key: string]: { x: number; y: number; name: string; region: string } } = {
  'AC': { x: 50, y: 190, name: 'Acre', region: 'Norte' },
  'AL': { x: 410, y: 160, name: 'Alagoas', region: 'Nordeste' },
  'AP': { x: 230, y: 50, name: 'Amapá', region: 'Norte' },
  'AM': { x: 100, y: 110, name: 'Amazonas', region: 'Norte' },
  'BA': { x: 330, y: 180, name: 'Bahia', region: 'Nordeste' },
  'CE': { x: 370, y: 90, name: 'Ceará', region: 'Nordeste' },
  'DF': { x: 260, y: 210, name: 'Distrito Federal', region: 'Centro-Oeste' },
  'ES': { x: 340, y: 260, name: 'Espírito Santo', region: 'Sudeste' },
  'GO': { x: 240, y: 220, name: 'Goiás', region: 'Centro-Oeste' },
  'MA': { x: 300, y: 100, name: 'Maranhão', region: 'Nordeste' },
  'MT': { x: 180, y: 190, name: 'Mato Grosso', region: 'Centro-Oeste' },
  'MS': { x: 180, y: 270, name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  'MG': { x: 300, y: 240, name: 'Minas Gerais', region: 'Sudeste' },
  'PA': { x: 210, y: 110, name: 'Pará', region: 'Norte' },
  'PB': { x: 410, y: 100, name: 'Paraíba', region: 'Nordeste' },
  'PR': { x: 220, y: 310, name: 'Paraná', region: 'Sul' },
  'PE': { x: 380, y: 120, name: 'Pernambuco', region: 'Nordeste' },
  'PI': { x: 340, y: 120, name: 'Piauí', region: 'Nordeste' },
  'RJ': { x: 320, y: 285, name: 'Rio de Janeiro', region: 'Sudeste' },
  'RN': { x: 410, y: 80, name: 'Rio Grande do Norte', region: 'Nordeste' },
  'RS': { x: 200, y: 370, name: 'Rio Grande do Sul', region: 'Sul' },
  'RO': { x: 120, y: 190, name: 'Rondônia', region: 'Norte' },
  'RR': { x: 110, y: 50, name: 'Roraima', region: 'Norte' },
  'SC': { x: 220, y: 340, name: 'Santa Catarina', region: 'Sul' },
  'SP': { x: 260, y: 290, name: 'São Paulo', region: 'Sudeste' },
  'SE': { x: 390, y: 175, name: 'Sergipe', region: 'Nordeste' },
  'TO': { x: 260, y: 150, name: 'Tocantins', region: 'Norte' }
};

export default function BrazilMap({ concursos, onSelectEstado, selectedEstado }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Group stats by state
  const getStatsByState = (uf: string) => {
    const list = concursos.filter(c => c.estado === uf);
    const inscritos = list.filter(c => ['Inscrito', 'Taxa Paga', 'Aguardando Prova', 'Prova Realizada'].includes(c.status)).length;
    const proximasProvas = list.filter(c => {
      const isFuture = new Date(c.dataProva).getTime() >= new Date('2026-06-10').getTime();
      const isActive = !['Aprovado', 'Resultado Publicado'].includes(c.status);
      return isFuture && isActive;
    }).length;

    const maxSalario = list.reduce((max, c) => c.salario > max ? c.salario : max, 0);

    return {
      cadastrados: list.length,
      inscritos,
      proximasProvas,
      maxSalario
    };
  };

  const hoveredStats = hoveredState ? getStatsByState(hoveredState) : null;
  const activeStats = selectedEstado ? getStatsByState(selectedEstado) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Interactive Map Visual */}
      <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 tracking-tight">
              Distribuição Geográfica de Concursos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Clique em um estado no mapa interativo para filtrar concursos locais
            </p>
          </div>
          {selectedEstado && (
            <button
              onClick={() => onSelectEstado(null)}
              className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 font-medium transition cursor-pointer"
            >
              Ver Todos os Estados
            </button>
          )}
        </div>

        {/* The SVG Styled Brazil Schematic Grid Map */}
        <div className="relative w-full aspect-[4/3] max-w-(--size-xl) mx-auto bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden p-4">
          <svg
            viewBox="0 0 480 430"
            className="w-full h-full select-none"
          >
            {/* Legend / State node indicators inside SVG */}
            <g className="opacity-75 dark:opacity-50">
              <rect x="15" y="365" width="10" height="10" rx="2" className="fill-indigo-600 dark:fill-indigo-500" />
              <text x="32" y="374" className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400 font-sans">Cadastrado</text>

              <rect x="15" y="383" width="10" height="10" rx="2" className="fill-emerald-500 dark:fill-emerald-400" />
              <text x="32" y="392" className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400 font-sans">Inscrição Ativa</text>

              <circle cx="20" cy="408" r="5" className="fill-rose-500" />
              <text x="32" y="411" className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400 font-sans">Prova Pendente</text>
            </g>

            {/* Connecting regional guidelines inside the Brazil Map logic */}
            <path d="M 100 110 L 210 110 L 300 100 L 340 120" fill="none" stroke="currentColor" className="stroke-slate-200 dark:stroke-slate-800/60" strokeDasharray="3 3" />
            <path d="M 260 210 L 300 240 M 260 290 L 300 240 M 260 290 L 220 310" fill="none" stroke="currentColor" className="stroke-slate-200 dark:stroke-slate-800/60" strokeDasharray="3 3" />

            {/* Render States as elegant visual pods */}
            {Object.entries(ESTADO_COORDINATES).map(([uf, state]) => {
              const stats = getStatsByState(uf);
              const isSelected = selectedEstado === uf;
              const isHovered = hoveredState === uf;
              
              // Color theme depending on quantity of active concursos
              let podColorClass = "fill-white dark:fill-slate-900 stroke-slate-250 dark:stroke-slate-800";
              let textClass = "fill-slate-700 dark:fill-slate-300";
              
              if (stats.cadastrados > 0) {
                if (stats.inscritos > 0) {
                  podColorClass = isSelected 
                    ? "fill-indigo-600 dark:fill-indigo-500 stroke-indigo-400" 
                    : "fill-indigo-50 dark:fill-indigo-950/40 stroke-indigo-200 dark:stroke-indigo-900/60";
                  textClass = isSelected ? "fill-white font-bold" : "fill-indigo-900 dark:fill-indigo-300 font-semibold";
                } else {
                  podColorClass = isSelected
                    ? "fill-amber-500 dark:fill-amber-600 stroke-amber-300"
                    : "fill-amber-50/70 dark:fill-amber-950/20 stroke-amber-200 dark:stroke-amber-900/40";
                  textClass = isSelected ? "fill-white font-bold" : "fill-amber-900 dark:fill-amber-400";
                }
              }

              if (isHovered && !isSelected) {
                podColorClass = "fill-indigo-100 dark:fill-indigo-900/50 stroke-indigo-400";
                textClass = "fill-indigo-900 dark:fill-indigo-200 font-bold";
              }

              return (
                <g
                  key={uf}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredState(uf)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onSelectEstado(selectedEstado === uf ? null : uf)}
                >
                  {/* Outer glow during hover / select */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={state.x}
                      cy={state.y}
                      r="19"
                      className="fill-indigo-500/10 dark:fill-indigo-400/15 animate-ping-slow"
                    />
                  )}

                  {/* State Circle Pod Base */}
                  <circle
                    cx={state.x}
                    cy={state.y}
                    r={isSelected ? "17" : "15"}
                    className={`${podColorClass} stroke-[1.5] shadow-xs cursor-pointer transition-all duration-300`}
                  />

                  {/* Mini-badge indicator for upcoming exams inside the state */}
                  {stats.proximasProvas > 0 && (
                    <circle
                      cx={state.x + 10}
                      cy={state.y - 10}
                      r="4"
                      className="fill-rose-500 stroke-white dark:stroke-slate-900 stroke-[1.5]"
                    />
                  )}

                  {/* Registered count ribbon */}
                  {stats.inscritos > 0 && !isSelected && (
                    <circle
                      cx={state.x - 10}
                      cy={state.y + 10}
                      r="3.5"
                      className="fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-[1]"
                    />
                  )}

                  {/* State Acronym text */}
                  <text
                    x={state.x}
                    y={state.y + 4.5}
                    textAnchor="middle"
                    className={`${textClass} text-[10px] font-mono tracking-tighter select-none font-bold`}
                  >
                    {uf}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Simple floating instruction indicator */}
          <div className="absolute top-2 right-2 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-500 dark:text-slate-400 pointer-events-none">
            Ancoragem: Jun/2026
          </div>
        </div>
      </div>

      {/* Side Detail Panel */}
      <div className="lg:col-span-4 space-y-6">
        {/* Selected or Hovered details */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          {selectedEstado || hoveredState ? (
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {ESTADO_COORDINATES[selectedEstado || hoveredState || ''].name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Região {ESTADO_COORDINATES[selectedEstado || hoveredState || ''].region}
                  </p>
                </div>
                <span className="ml-auto text-xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {selectedEstado || hoveredState}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Cadastrados</span>
                    <span className="text-lg font-bold text-slate-950 dark:text-white font-mono">
                      {(hoveredStats || activeStats)?.cadastrados || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Em Andamento</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {(hoveredStats || activeStats)?.inscritos || 0}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/40 dark:border-rose-950/30 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-rose-700 dark:text-rose-400 font-mono uppercase font-bold">Provas Agendadas</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Nas próximas semanas</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {(hoveredStats || activeStats)?.proximasProvas || 0}
                  </span>
                </div>

                <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/40 dark:border-indigo-950/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-indigo-700 dark:text-indigo-400 font-mono uppercase font-bold">Teto Salarial</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Maior salário cadastrado</span>
                  </div>
                  <span className="text-sm font-semibold font-mono text-indigo-700 dark:text-indigo-400">
                    {(hoveredStats || activeStats)?.maxSalario 
                      ? `R$ ${(hoveredStats || activeStats)!.maxSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                      : 'R$ 0,00'}
                  </span>
                </div>
              </div>

              {selectedEstado && (
                <div className="mt-5 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                    Visualizando somente concursos de {selectedEstado} na listagem
                  </p>
                  <button
                    onClick={() => onSelectEstado(null)}
                    className="w-full text-xs py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition font-medium cursor-pointer"
                  >
                    Remover filtro do mapa
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-650 dark:text-slate-400">
                Passe o mouse ou toque em qualquer estado no mapa para ver resumo de dados regionalizados.
              </p>
            </div>
          )}
        </div>

        {/* Brasil Status Board */}
        <div className="p-6 bg-linear-to-b from-indigo-900 to-slate-900 border border-indigo-950 text-white rounded-3xl shadow-sm">
          <h4 className="text-sm font-mono uppercase tracking-wider text-indigo-300">Brasil Concursos</h4>
          <h3 className="text-xl font-bold mt-1 text-white">Preparado para a Posse?</h3>
          <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
            As principais agências judiciárias e fiscais estão concentradas em <b>SP, RJ e DF</b>. Colecione suas conquistas e monitore os editais no nosso radar exclusivo.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-indigo-100 bg-white/10 p-3 rounded-xl">
            <span>Teto Geral Localizado:</span>
            <span className="font-bold font-mono text-indigo-300">
              R$ {Math.max(...concursos.map(c => c.salario), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
