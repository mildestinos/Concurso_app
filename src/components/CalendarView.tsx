import React, { useState } from 'react';
import { Concurso } from '../types';
import { ChevronLeft, ChevronRight, Bell, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarViewProps {
  concursos: Concurso[];
}

const NOME_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface CalendarEvent {
  id: string;
  concursoId: string;
  concursoTitle: string;
  tipo: 'abertura' | 'fechamento' | 'pagamento' | 'prova' | 'resultado';
  label: string;
  color: string;
  borderColor: string;
  txtColor: string;
  orgao: string;
  cargo: string;
}

export default function CalendarView({ concursos }: CalendarViewProps) {
  // Anchored to June 10, 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-10'));
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(activeYear, activeMonth);
  const firstDayIndex = getFirstDayOfMonth(activeYear, activeMonth);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(activeYear, activeMonth - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(activeYear, activeMonth + 1, 1));
    setSelectedDayEvents(null);
  };

  // Compile all possible calendar events for active month/year helper
  const getEventsForDate = (day: number) => {
    const eventsList: CalendarEvent[] = [];
    const pad = (n: number) => n.toString().padStart(2, '0');
    const todayStr = `${activeYear}-${pad(activeMonth + 1)}-${pad(day)}`;

    concursos.forEach(c => {
      // 1. Prova
      if (c.dataProva === todayStr) {
        eventsList.push({
          id: `${c.id}-prova`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'prova',
          label: '📅 DIA DA PROVA',
          color: 'bg-rose-500 dark:bg-rose-350',
          borderColor: 'border-rose-600',
          txtColor: 'text-rose-700 dark:text-rose-100',
          orgao: c.orgao,
          cargo: c.cargo
        });
      }
      // 2. Vencimento da Taxa
      if (c.dataPagamentoVencimento === todayStr) {
        eventsList.push({
          id: `${c.id}-pagamento`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'pagamento',
          label: '💸 Vencimento da Taxa',
          color: 'bg-amber-500 dark:bg-amber-300',
          borderColor: 'border-amber-600',
          txtColor: 'text-amber-700 dark:text-amber-100',
          orgao: c.orgao,
          cargo: c.cargo
        });
      }
      // 3. Abertura Inscrição
      if (c.dataInscricaoAbertura === todayStr) {
        eventsList.push({
          id: `${c.id}-abertura`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'abertura',
          label: '🟢 Início das Inscrições',
          color: 'bg-emerald-500',
          borderColor: 'border-emerald-600',
          txtColor: 'text-emerald-700 dark:text-emerald-100',
          orgao: c.orgao,
          cargo: c.cargo
        });
      }
      // 4. Fechamento Inscrição
      if (c.dataInscricaoFechamento === todayStr) {
        eventsList.push({
          id: `${c.id}-fechamento`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'fechamento',
          label: '🛑 Último Dia de Inscrição',
          color: 'bg-red-500',
          borderColor: 'border-red-600',
          txtColor: 'text-red-700 dark:text-red-100',
          orgao: c.orgao,
          cargo: c.cargo
        });
      }
      // 5. Resultado
      if (c.dataResultado === todayStr) {
        eventsList.push({
          id: `${c.id}-resultado`,
          concursoId: c.id,
          concursoTitle: `${c.orgao} - ${c.cargo}`,
          tipo: 'resultado',
          label: '🏆 Divulgação de Resultados',
          color: 'bg-indigo-500',
          borderColor: 'border-indigo-600',
          txtColor: 'text-indigo-700 dark:text-indigo-100',
          orgao: c.orgao,
          cargo: c.cargo
        });
      }
    });

    return eventsList;
  };

  const handleDayClick = (day: number, events: CalendarEvent[]) => {
    setSelectedDayEvents({ day, events });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Calendar Grid Container */}
      <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50 tracking-tight">
                {NOME_MESES[activeMonth]} {activeYear}
              </h2>
              <p className="text-xs text-slate-400">Clique sobre um dia para inspecionar compromissos</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date('2026-06-10'))}
              className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 text-slate-650 dark:text-slate-300 transition cursor-pointer"
            >
              Hoje (Jun/26)
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Main Grid */}
        <div className="grid grid-cols-7 gap-1 border-t border-slate-100 dark:border-slate-800 pt-4">
          {DIAS_SEMANA.map((dayLabel, idx) => (
            <div key={idx} className="text-center font-mono text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 py-1.5">
              {dayLabel}
            </div>
          ))}

          {/* Empty starter days */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 md:h-20 bg-slate-50/30 dark:bg-slate-950/10 rounded-lg opacity-30" />
          ))}

          {/* Active Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const events = getEventsForDate(day);
            const isToday = activeYear === 2026 && activeMonth === 5 && day === 10;
            const hasEvents = events.length > 0;
            
            return (
              <div
                key={`day-${day}`}
                onClick={() => handleDayClick(day, events)}
                className={`h-16 md:h-20 p-1 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-900 rounded-xl relative cursor-pointer hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition group`}
              >
                {/* Day number */}
                <span className={`text-[10px] md:text-xs font-mono font-black ${
                  isToday 
                    ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400'
                } block`}>
                  {day}
                </span>

                {/* Micro Event Indicators */}
                <div className="mt-1 flex flex-wrap gap-0.5 max-h-12 overflow-hidden">
                  {events.map((evt, eIdx) => (
                    <div
                      key={eIdx}
                      className={`h-1 py-0.5 rounded-sm w-full font-sans text-[8px] leading-3 truncate ${evt.color} ${evt.txtColor} px-1 font-bold ${
                        evt.tipo === 'prova' ? 'animate-pulse' : ''
                      }`}
                      title={`${evt.concursoTitle}: ${evt.label}`}
                    >
                      <span className="hidden md:inline">{evt.label.replace('Divulgação de ', '')}:</span> {evt.orgao}
                    </div>
                  ))}
                </div>

                {/* Dot for mobile sizing */}
                {hasEvents && (
                  <div className="md:hidden absolute bottom-1 right-1 flex gap-0.5">
                    {events.map((e, eIdx) => (
                      <span key={eIdx} className={`h-1.5 w-1.5 rounded-full ${e.tipo === 'prova' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Selected Agenda Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50 mb-1 flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            Agenda Detalhada
          </h3>

          {selectedDayEvents ? (
            <div className="mt-4 space-y-4">
              <div className="font-mono text-xs text-slate-400">
                Eventos do dia: <b className="text-slate-700 dark:text-slate-100">{selectedDayEvents.day.toString().padStart(2, '0')}/{NOME_MESES[activeMonth]}</b>
              </div>

              {selectedDayEvents.events.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.events.map((evt, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border-l-4 border-y border-r border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/60 leading-normal`}
                      style={{ borderLeftColor: evt.tipo === 'prova' ? '#ef4444' : '#6366f1' }}
                    >
                      <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase block text-indigo-600 dark:text-indigo-400">{evt.label}</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{evt.orgao}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cargo: {evt.cargo}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhum compromisso marcado para este dia.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 mt-4 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-2xl">
              <CalendarIcon className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-(--size-xs) mx-auto px-4 leading-normal">
                Clique sobre qualquer dia pontuado do calendário para verificar compromissos específicos.
              </p>
            </div>
          )}
        </div>

        {/* Legend Panel & General Guidelines */}
        <div className="p-6 bg-indigo-950 text-white rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5"><Info className="h-4 w-4" /> Legenda do Calendário</h4>
            <p className="text-[11px] text-indigo-300 mt-0.5">As datas são monitoradas individualmente por concurso cadastrado ou importado.</p>
          </div>
          
          <div className="space-y-3 text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
              <span><b>Vermelho (Provas)</b>: Dias reservados para a realização do exame teórico ou prático.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
              <span><b>Amarelo (Taxas)</b>: Últimos prazos para emissão e quitação de boletos GRU/taxas.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
              <span><b>Verde (Aberturas)</b>: Início do período de submissão de candidaturas.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
              <span><b>Vermelho Escuro</b>: Fim definitivo com horário limite de inscrições do edital.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-indigo-500 shrink-0" />
              <span><b>Índigo (Resultado)</b>: Previsto para liberação das notas oficiais.</span>
            </div>
          </div>
        </div>

        {/* Dynamic Auto-fill Explainer Card */}
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300 rounded-3xl">
          <h4 className="text-xs font-black tracking-wider uppercase font-mono text-emerald-600 dark:text-emerald-450">🔄 Sincronização e Preenchimento Automático</h4>
          <p className="text-xs mt-2 leading-relaxed">
            Seja cadastrando manualmente ou selecionando <b>"Fazer Inscrição"</b> em qualquer concurso pesquisado no motor do Gemini, o sistema:
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] list-disc list-inside opacity-90 leading-relaxed">
            <li><b>Autopovoamento inteligente</b>: Resgata as datas de inscrição, vencimento, prova e resultado do edital.</li>
            <li><b>Plotagem Automática</b>: Seus compromissos aparecem imediatamente nos dias agendados deste calendário.</li>
            <li><b>Sem Preocupação</b>: Quando você se inscreve na banca oficial vinculada, os status de pagamento e alertas são recalculados automaticamente!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
