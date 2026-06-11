/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Concurso, Alerta, StatusConcurso, StatusTaxa } from './types';
import { INITIAL_CONCURSOS, generateAlerts, STATUS_DATA, ESTADOS, formatBRLDate, BANCA_LINKS, getBancaLink } from './data';
import BrazilMap from './components/BrazilMap';
import FinanceDashboard from './components/FinanceDashboard';
import CalendarView from './components/CalendarView';
import ReportsPanel from './components/ReportsPanel';
import ContestFormModal from './components/ContestFormModal';
import LoginView from './components/LoginView';
import {
  Brain,
  LayoutDashboard,
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  DollarSign,
  Map as MapIcon,
  FileText,
  Bell,
  Sun,
  Moon,
  Trash2,
  Edit,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function App() {
  // 0. User Account Session State
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    // 1. Check if there is an explicit permanent user saved in localStorage (e.g. logged in with a real email, or Google)
    const savedUser = localStorage.getItem('radar_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // Fall through
      }
    }
    
    // 2. Otherwise, check if this tab already has an active guest session in sessionStorage to avoid regeneration on simple tab refresh
    const sessionUser = sessionStorage.getItem('radar_guest_user');
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (e) {
        // Fall through
      }
    }
    
    // 3. Auto-create a brand new student/candidate guest session so that any shared link, new tab, or private window bypasses the login wall completely with a clean/unique email address
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const autoUser = {
      email: `estudante_${randomId}@radarconcursos.com.br`,
      name: `Concurseiro ${randomId}`
    };
    sessionStorage.setItem('radar_guest_user', JSON.stringify(autoUser));
    return autoUser;
  });

  // Initials computation
  const userInitials = useMemo(() => {
    if (!currentUser) return 'CV';
    const parts = currentUser.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.name.slice(0, 2).toUpperCase();
  }, [currentUser]);

  // 1. Initial State Persistence with User Sandbox Isolation
  const [concursos, setConcursos] = useState<Concurso[]>([]);

  // Load user data on user state login trigger
  useEffect(() => {
    if (currentUser) {
      const userKey = `radar_concursos_data_${currentUser.email}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          setConcursos(JSON.parse(saved));
        } catch (e) {
          setConcursos(INITIAL_CONCURSOS);
        }
      } else {
        // If first login, let's copy whatever they had in raw storage, or give INITIAL_CONCURSOS
        const rawSaved = localStorage.getItem('radar_concursos_data');
        if (rawSaved) {
          try {
            const parsed = JSON.parse(rawSaved);
            setConcursos(parsed);
            localStorage.setItem(userKey, rawSaved);
          } catch (e) {
            setConcursos(INITIAL_CONCURSOS);
          }
        } else {
          setConcursos(INITIAL_CONCURSOS);
        }
      }
    } else {
      setConcursos([]);
    }
  }, [currentUser]);

  // Save changes back to Sandbox key
  useEffect(() => {
    if (currentUser) {
      const userKey = `radar_concursos_data_${currentUser.email}`;
      localStorage.setItem(userKey, JSON.stringify(concursos));
      localStorage.setItem('radar_concursos_data', JSON.stringify(concursos)); // Fallback
    }
  }, [concursos, currentUser]);

  // Logout Handler
  const handleSignOut = () => {
    if (window.confirm('Deseja realmente sair da sua conta no Radar?')) {
      localStorage.removeItem('radar_user');
      sessionStorage.removeItem('radar_guest_user');
      setCurrentUser(null);
    }
  };

  const [showShareToast, setShowShareToast] = useState(false);
  const handleShareLink = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 5000);
    }).catch(() => {
      alert("Link copiado: " + cleanUrl);
    });
  };

  // 2. Active Tab View
  // 'dashboard' | 'concursos' | 'calendario' | 'mapa' | 'financeiro' | 'relatorios'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Theme Toggle Support
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('radar_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('radar_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('radar_theme', 'light');
    }
  }, [isDark]);

  // 4. Add/Edit Dialog modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contestToEdit, setContestToEdit] = useState<Concurso | null>(null);

  // 5. Dynamic Alerts Engine
  const activeAlerts = useMemo(() => {
    return generateAlerts(concursos);
  }, [concursos]);

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  
  const visibleAlerts = useMemo(() => {
    return activeAlerts.filter(a => !dismissedAlertIds.includes(a.id));
  }, [activeAlerts, dismissedAlertIds]);

  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  // 6. State Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterBanca, setFilterBanca] = useState<string>('Todos');
  const [filterDataMin, setFilterDataMin] = useState('');
  const [filterDataMax, setFilterDataMax] = useState('');
  const [sortBy, setSortBy] = useState<string>('dataProvaAsc'); // 'dataProvaAsc' | 'salarioDesc' | 'vagasDesc' | 'recent'
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // 6b. Live Search (On-demand Web Crawling with Gemini + Google Grounding) states
  const [contestTabSubMode, setContestTabSubMode] = useState<'meus' | 'buscar_ia'>('meus');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<any[]>([]);
  const [onlineSources, setOnlineSources] = useState<any[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [onlineIsFallback, setOnlineIsFallback] = useState<boolean>(false);
  const [onlineFallbackDetails, setOnlineFallbackDetails] = useState<string | null>(null);
  const [importSuccessAlert, setImportSuccessAlert] = useState<string | null>(null);

  const handleOnlineSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineQuery.trim()) return;

    setOnlineLoading(true);
    setOnlineError(null);
    setOnlineResults([]);
    setOnlineSources([]);
    setOnlineIsFallback(false);
    setOnlineFallbackDetails(null);

    try {
      const response = await fetch('/api/concursos/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: onlineQuery })
      });

      if (!response.ok) {
        let errMessage = 'Falha na resposta do servidor.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMessage = errData.details
              ? `${errData.error}\n\nDetalhes: ${errData.details}`
              : errData.error;
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      if (data.success) {
        setOnlineResults(data.results || []);
        setOnlineSources(data.sources || []);
        if (data.isFallback) {
          setOnlineIsFallback(true);
          setOnlineFallbackDetails(data.fallbackDetails);
        }
      } else {
        setOnlineError(data.error || 'Erro inesperado na busca de editais.');
      }
    } catch (err: any) {
      console.error(err);
      setOnlineError(err.message.includes('Falha na resposta') || err.message === 'Failed to fetch'
        ? 'Não foi possível conectar com o servidor para realizar a pesquisa em tempo real. Certifique-se de que o servidor está rodando.'
        : err.message
      );
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleImportOnlineContest = (c: any) => {
    const newId = `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const importedContest: Concurso = {
      id: newId,
      orgao: c.orgao || 'Órgão Desconhecido',
      cargo: c.cargo || 'Cargo Geral',
      banca: c.banca || 'A Definir',
      estado: c.estado || 'SP',
      cidadeProva: c.cidadeProva || 'São Paulo',
      salario: Number(c.salario) || 0,
      vagas: Number(c.vagas) || 1,
      linkEdital: c.linkEdital || '',
      dataInscricaoAbertura: c.dataInscricaoAbertura || '2026-06-10',
      dataInscricaoFechamento: c.dataInscricaoFechamento || '2026-07-10',
      dataPagamentoVencimento: c.dataPagamentoVencimento || '2026-07-11',
      valorTaxa: Number(c.valorTaxa) || 0,
      statusTaxa: 'Pendente',
      dataProva: c.dataProva || '2026-08-30',
      dataResultado: c.dataResultado || '2026-09-30',
      status: 'Interesse',
      observacoes: c.observacoes || 'Importado via busca inteligente ao vivo.',
      createdAt: new Date().toISOString()
    };

    setConcursos(prev => [...prev, importedContest]);
    setImportSuccessAlert(`Sucesso! Concurso "${importedContest.orgao}" foi importado para os seus Concursos no Radar!`);
    
    // Auto clear alert
    setTimeout(() => {
      setImportSuccessAlert(null);
    }, 4500);
  };

  const handleImportAndRegisterOnlineContest = (c: any) => {
    const newId = `imported-${Date.now()}-${Math.floor(Math.random() * 1050)}`;
    const importedContest: Concurso = {
      id: newId,
      orgao: c.orgao || 'Órgão Desconhecido',
      cargo: c.cargo || 'Cargo Geral',
      banca: c.banca || 'A Definir',
      estado: c.estado || 'SP',
      cidadeProva: c.cidadeProva || 'São Paulo',
      salario: Number(c.salario) || 0,
      vagas: Number(c.vagas) || 1,
      linkEdital: c.linkEdital || '',
      dataInscricaoAbertura: c.dataInscricaoAbertura || '2026-06-10',
      dataInscricaoFechamento: c.dataInscricaoFechamento || '2026-07-10',
      dataPagamentoVencimento: c.dataPagamentoVencimento || '2026-07-11',
      valorTaxa: Number(c.valorTaxa) || 0,
      statusTaxa: 'Pendente',
      dataProva: c.dataProva || '2026-08-30',
      dataResultado: c.dataResultado || '2026-09-30',
      status: 'Inscrito', // Mark immediately as enrolled!
      observacoes: c.observacoes || 'Inscrição registrada e salva diretamente no Radar.',
      createdAt: new Date().toISOString()
    };

    setConcursos(prev => [...prev, importedContest]);
    setImportSuccessAlert(`Inscrição Realizada! "${importedContest.orgao}" foi adicionado à sua lista de estudos como Inscrito.`);
    
    // Auto clear alert
    setTimeout(() => {
      setImportSuccessAlert(null);
    }, 4500);

    const targetUrl = getBancaLink(c.banca) || c.linkEdital;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  // Unique list of Bancas currently registered for filter selectors
  const bancaList = useMemo(() => {
    const list = new Set<string>();
    concursos.forEach(c => {
      if (c.banca) list.add(c.banca);
    });
    return Array.from(list);
  }, [concursos]);

  // Grouped active bank/banca statistics to link candidate portals dynamically
  const activeBancasStats = useMemo(() => {
    const stats: Record<string, { total: number; inscritos: number; link: string | null }> = {};
    concursos.forEach(c => {
      if (!c.banca) return;
      const b = c.banca.trim();
      if (!stats[b]) {
        stats[b] = { total: 0, inscritos: 0, link: getBancaLink(b) };
      }
      stats[b].total += 1;
      if (c.status === 'Inscrito' || c.status === 'Taxa Paga' || c.status === 'Taxa Pendente' || c.status === 'Aguardando Prova') {
        stats[b].inscritos += 1;
      }
    });

    return Object.entries(stats).map(([name, val]) => ({
      name,
      ...val
    }));
  }, [concursos]);

  // 7. Save or Update Contest record
  const handleSaveContest = (updated: Concurso) => {
    const exists = concursos.some(c => c.id === updated.id);
    if (exists) {
      setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
    } else {
      setConcursos(prev => [updated, ...prev]);
    }
    setContestToEdit(null);
  };

  // 8. Delete Contest
  const handleDeleteContest = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este concurso do seu radar?')) {
      setConcursos(prev => prev.filter(c => c.id !== id));
    }
  };

  // Quick mark paid
  const toggleFeePaid = (id: string, current: StatusTaxa) => {
    const nextStatus: StatusTaxa = current === 'Paga' ? 'Pendente' : 'Paga';
    setConcursos(prev => prev.map(c => {
      if (c.id === id) {
        // Also sync status if transitioning
        let nextContestStatus = c.status;
        if (nextStatus === 'Paga' && c.status === 'Taxa Pendente') {
          nextContestStatus = 'Aguardando Prova';
        }
        return {
          ...c,
          statusTaxa: nextStatus,
          status: nextContestStatus
        };
      }
      return c;
    }));
  };

  // Filter & Sort core process
  const filteredConcursos = useMemo(() => {
    let result = [...concursos];

    // Search query matches orgao, cargo or banca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.orgao.toLowerCase().includes(q) ||
        c.cargo.toLowerCase().includes(q) ||
        c.banca.toLowerCase().includes(q) ||
        c.cidadeProva.toLowerCase().includes(q)
      );
    }

    // Estado filter
    if (filterEstado !== 'Todos') {
      result = result.filter(c => c.estado === filterEstado);
    }

    // Status filter
    if (filterStatus !== 'Todos') {
      result = result.filter(c => c.status === filterStatus);
    }

    // Banca filter
    if (filterBanca !== 'Todos') {
      result = result.filter(c => c.banca === filterBanca);
    }

    // Date range filter
    if (filterDataMin) {
      result = result.filter(c => c.dataProva >= filterDataMin);
    }
    if (filterDataMax) {
      result = result.filter(c => c.dataProva <= filterDataMax);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'dataProvaAsc') {
        return a.dataProva.localeCompare(b.dataProva);
      }
      if (sortBy === 'dataProvaDesc') {
        return b.dataProva.localeCompare(a.dataProva);
      }
      if (sortBy === 'salarioDesc') {
        return b.salario - a.salario;
      }
      if (sortBy === 'salarioAsc') {
        return a.salario - b.salario;
      }
      if (sortBy === 'vagasDesc') {
        return b.vagas - a.vagas;
      }
      if (sortBy === 'recent') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });

    return result;
  }, [concursos, searchQuery, filterEstado, filterStatus, filterBanca, filterDataMin, filterDataMax, sortBy]);

  // Dashboard calculations
  const stats = useMemo(() => {
    const totalCount = concursos.length;
    // Count matches "Inscrito" or active processes
    const inscritosCount = concursos.filter(c => 
      ['Inscrito', 'Taxa Paga', 'Aguardando Prova', 'Prova Realizada'].includes(c.status)
    ).length;
    
    const paidCount = concursos.filter(c => c.statusTaxa === 'Paga').length;
    const pendingCount = concursos.filter(c => c.statusTaxa === 'Pendente').length;
    
    // Future in-progress exams list
    const proximasProvasList = concursos
      .filter(c => {
        const isFuture = new Date(c.dataProva).getTime() >= new Date('2026-06-10').getTime();
        const isActiveState = !['Aprovado', 'Resultado Publicado'].includes(c.status);
        return isFuture && isActiveState;
      })
      .sort((a,b) => a.dataProva.localeCompare(b.dataProva))
      .slice(0, 4);

    // Active Concursos List
    const emAndamentoList = concursos
      .filter(c => !['Aprovado', 'Resultado Publicado'].includes(c.status))
      .slice(0, 5);

    return {
      totalCount,
      inscritosCount,
      paidCount,
      pendingCount,
      proximasList: proximasProvasList,
      andamentoList: emAndamentoList
    };
  }, [concursos]);

  // Handle click on map state
  const handleMapStateSelect = (uf: string | null) => {
    setFilterEstado(uf || 'Todos');
    setActiveTab('concursos');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterEstado('Todos');
    setFilterStatus('Todos');
    setFilterBanca('Todos');
    setFilterDataMin('');
    setFilterDataMax('');
  };

  // Render LoginView gateway if not authenticated
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(email, userName) => {
          const userObj = { email, name: userName };
          localStorage.setItem('radar_user', JSON.stringify(userObj));
          setCurrentUser(userObj);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] font-sans text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* Global CSS overrides for clean native printing without header/side components */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print, header, nav, aside, footer, button, .modal, .toast {
            display: none !important;
          }
          .printable-element {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            display: block !important;
          }
        }
        .animate-ping-slow {
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* SIDEBAR FOR DESKTOP (Only on LG and Larger Screens) */}
      <aside className="hidden lg:flex w-66 border-r border-slate-200/80 dark:border-slate-800/80 flex-col bg-white dark:bg-[#0F172A] no-print shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
            <Brain className="h-5.5 w-5.5 stroke-[1.8] animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-650 to-blue-500 bg-clip-text text-transparent flex items-center gap-1.5 font-sans dark:from-blue-400 dark:to-indigo-300">
              Radar Concursos
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold tracking-tight uppercase">SaaS de Preparação</p>
          </div>
        </div>
        
        {/* Nav list on desktop */}
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {[
            { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
            { id: 'concursos', label: 'Meus Concursos', icon: Briefcase },
            { id: 'calendario', label: 'Calendário de Provas', icon: CalendarIcon },
            { id: 'mapa', label: 'Mapa do Brasil', icon: MapIcon },
            { id: 'financeiro', label: 'Área Financeira', icon: DollarSign },
            { id: 'relatorios', label: 'Relatórios & Export', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsAlertsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Profile widget to match the design blueprint */}
        {currentUser && (
          <div className="p-5 border-t border-slate-150 dark:border-slate-800/85 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm select-none border border-blue-500/20 shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-850 dark:text-white leading-tight truncate" title={currentUser.name}>
                  {currentUser.name}
                </div>
                <div className="text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5" title={currentUser.email}>
                  {currentUser.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              id="sidebar_signout_btn"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition shrink-0 cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </aside>

      {/* CORE CONTENT SEGMENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* HEADER NAV (Shown on all screens, but refined as top action bar next to sidebar on large screens) */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-150 dark:border-slate-800/80 transition-colors duration-200 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            
            {/* Header branding on Mobile (hidden on desktop) */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm flex items-center justify-center">
                <Brain className="h-5.5 w-5.5 stroke-[1.8] animate-pulse" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-blue-600 dark:text-blue-400">
                  Radar Concursos
                </span>
                <p className="text-[9px] text-slate-400 font-mono tracking-tight uppercase">SaaS de Preparação</p>
              </div>
            </div>

            {/* Desktop Dashboard Screen Name title indicator */}
            <div className="hidden lg:block">
              <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                Painel Executivo <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/10 uppercase">v2.0</span>
              </h2>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              {/* Share link button */}
              <button
                onClick={handleShareLink}
                className="px-3 py-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-blue-500/10 no-print"
                title="Compartilhar Link sem Login"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compartilhar Link</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 transition cursor-pointer"
                title="Alternar Tema"
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={handleSignOut}
                id="mobile_signout_btn"
                className="lg:hidden p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 hover:text-red-500 transition cursor-pointer"
                title="Sair da Conta"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>

              {/* Notification Alerts Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsAlertsDrawerOpen(!isAlertsDrawerOpen)}
                  className="p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 transition relative cursor-pointer"
                  title="Notificações e Alertas"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {visibleAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-[9px] font-bold font-mono flex items-center justify-center animate-bounce">
                      {visibleAlerts.length}
                    </span>
                  )}
                </button>

                {/* Floating Notifications Drawer */}
                {isAlertsDrawerOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xl p-4 z-50 transition-all">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1">
                        <Bell className="h-4 w-4 text-red-500" /> Alertas Ativos ({visibleAlerts.length})
                      </span>
                      <button
                        onClick={() => setIsAlertsDrawerOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {visibleAlerts.map(alert => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-2xl border text-xs relative ${
                            alert.gravidade === 'danger'
                              ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                              : alert.gravidade === 'warning'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-400'
                          }`}
                        >
                          <button
                            onClick={() => setDismissedAlertIds(prev => [...prev, alert.id])}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-605"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <span className="block font-bold text-[10px] tracking-wider uppercase opacity-85 mb-0.5">{alert.concursoTitle}</span>
                          <p className="leading-relaxed pr-4">{alert.mensagem}</p>
                        </div>
                      ))}
                      {visibleAlerts.length === 0 && (
                        <div className="py-6 text-center text-xs text-slate-450 font-mono">
                          Nenhum alerta pendente. Ótimo progresso!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Add Contest Button */}
              <button
                onClick={() => {
                  setContestToEdit(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl tracking-tight transition duration-150 hover:scale-102 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo Concurso</span>
              </button>
            </div>
          </div>
        </header>

        {/* NAVIGATION TABS RAIL (ONLY SHOWN ON MOBILE / TABLET < lg) */}
        <nav className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800/70 transition-colors duration-200 no-print">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex gap-1 h-12 items-center">
            {[
              { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
              { id: 'concursos', label: 'Meus Concursos', icon: Briefcase },
              { id: 'calendario', label: 'Calendário de Provas', icon: CalendarIcon },
              { id: 'mapa', label: 'Mapa do Brasil', icon: MapIcon },
              { id: 'financeiro', label: 'Área Financeira', icon: DollarSign },
              { id: 'relatorios', label: 'Relatórios & Export', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsAlertsDrawerOpen(false);
                  }}
                  className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl transition duration-150 cursor-pointer shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* MAIN CONTAINER */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* VIEW ROUTER */}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Notification Toast for Urgent Action */}
            {visibleAlerts.length > 0 && (
              <div className="p-4 bg-rose-500/10 dark:bg-rose-500/5 hover:bg-rose-500/12 transition border border-rose-500/20 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950 dark:text-rose-400">Você possui notificações pendentes!</h4>
                    <p className="text-xs text-rose-800 dark:text-slate-400 mt-0.5">
                      Fatos importantes como datas finais de inscrição ou taxas vencendo hoje exigem sua atenção imediata.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertsDrawerOpen(true)}
                  className="px-4 py-2 text-[11px] font-bold bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition tracking-tight self-start md:self-auto cursor-pointer"
                >
                  Resolver Alertas
                </button>
              </div>
            )}

            {/* Welcome banner */}
            <div className="p-6 md:p-8 bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-3xl border border-indigo-950 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold font-mono text-indigo-300 flex items-center gap-1.5"><Sparkles className="h-3 w-3 fill-indigo-300" /> Dashboard Consolidado</span>
                <h1 className="text-2xl md:text-3xl font-black mt-1 font-sans">Bem-vindo ao seu Radar de Concursos</h1>
                <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                  Acompanhe cronogramas de editais, monitore o pagamento de taxas de inscrição e agende revisões com precisão milimétrica.
                </p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0 font-mono text-center">
                <span className="text-[10px] block opacity-70 tracking-widest uppercase">Ancoragem do Sistema</span>
                <span className="text-sm font-bold text-indigo-100 flex items-center gap-1 mt-0.5 justify-center">
                  <Clock className="h-4 w-4" /> 10 de Junho, 2026
                </span>
              </div>
            </div>

            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Inscritos */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Em Andamento</span>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 font-mono">{stats.inscritosCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Concursos ativos inscritos</p>
                </div>
              </div>

              {/* Card 2: Taxas Pagas */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Taxas Pagas</span>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 font-mono">{stats.paidCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Valores quitados</p>
                </div>
              </div>

              {/* Card 3: Taxas Pendentes */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs flex items-center gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Taxas Pendentes</span>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 font-mono">{stats.pendingCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Aguardando quitação</p>
                </div>
              </div>

              {/* Card 4: Total Geral Cadastros */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs flex items-center gap-4">
                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-2xl">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Cadastros Totais</span>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 font-mono">{stats.totalCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Entre interesse e resultado</p>
                </div>
              </div>
            </div>

            {/* Dashboard grid columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Column Left: Proximas Provas */}
              <div className="col-span-1 lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                      <CalendarIcon className="h-4.5 w-4.5 text-indigo-600" /> Próximas Provas no Horizonte
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Visão cronológica de exames confirmados</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('calendario')}
                    className="text-xs hover:underline font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                  >
                    Ver Calendário Completo
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {stats.proximasList.map((c, i) => {
                    const daysLeft = Math.ceil((new Date(c.dataProva).getTime() - new Date('2026-06-10').getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-900/60 transition hover:border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 font-mono text-[10px] font-black text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 rounded-xl flex flex-col items-center justify-center p-1 leading-tight">
                            <span>DF</span>
                            <span>{c.estado}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.orgao} - {c.cargo}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Banca: {c.banca} • Cidade: {c.cidadeProva}</p>
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-0 text-right flex items-center gap-3 self-end sm:self-auto">
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-extrabold">
                            {formatBRLDate(c.dataProva)}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Faltam <b>{daysLeft}</b> dias
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {stats.proximasList.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 font-mono">
                      Nenhuma prova agendada para os próximos meses.
                    </div>
                  )}
                </div>
              </div>

              {/* Column Right: Recentes and alert overview */}
              <div className="col-span-1 lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/70 rounded-3xl shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50 pb-4 border-b border-slate-100 dark:border-slate-800">
                    Acompanhamento por Estágio
                  </h3>
                  
                  {/* Status stage micro cards */}
                  <div className="mt-4 space-y-2.5">
                    {stats.andamentoList.map((c, i) => {
                      const metadata = STATUS_DATA[c.status] || { label: c.status, bg: 'bg-slate-100 text-slate-800' };
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100/40 dark:border-slate-900">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-44">{c.orgao}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{c.cargo}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full ${metadata.bg} border border-black/5`}>
                            {metadata.label}
                          </span>
                        </div>
                      );
                    })}
                    {stats.andamentoList.length === 0 && (
                      <p className="text-xs text-slate-400 font-mono text-center py-6">Nenhum concurso sob acompanhamento.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100/30 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase font-mono">Resumo Financeiro</span>
                    <p className="text-[11px] text-slate-500">Total investido nas taxas de inscrição</p>
                  </div>
                  <h3 className="text-base font-black font-mono text-indigo-700 dark:text-indigo-400">
                    R$ {concursos.filter(c => c.statusTaxa === 'Paga').reduce((s,o) => s + o.valorTaxa, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick map integration summary */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">Exploração e Distribuição por Estados</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Acesse o mapa para conferir as distribuições de concursos e editais por Região</p>
                </div>
                <button
                  onClick={() => setActiveTab('mapa')}
                  className="px-4 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-xl cursor-pointer hover:bg-indigo-100 transition"
                >
                  Abrir Mapa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONCURSOS LIST VIEW */}
        {activeTab === 'concursos' && (
          <div className="space-y-6 select-text">
            
            {/* Elegant Sub-Mode Switcher: Saved vs Live Web IA Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
              <div>
                <h2 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  Gerenciar Editais & Concursos
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Defina sua trajetória de estudos ou pesquise novos editais reais.</p>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-stretch sm:self-auto">
                <button
                  id="tab_sub_meus"
                  onClick={() => setContestTabSubMode('meus')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    contestTabSubMode === 'meus'
                      ? 'bg-white dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Meus Concursos Salvos ({concursos.length})
                </button>
                <button
                  id="tab_sub_buscar_ia"
                  onClick={() => setContestTabSubMode('buscar_ia')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 relative cursor-pointer ${
                    contestTabSubMode === 'buscar_ia'
                      ? 'bg-white dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Pesquisa Real IA (Google)
                  <span className="flex h-1.5 w-1.5 absolute top-1 right-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* Banner of dynamic Toast message after importing a contest */}
            {importSuccessAlert && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{importSuccessAlert}</span>
              </div>
            )}

            {contestTabSubMode === 'meus' ? (
              <>
                {/* DYNAMIC BANCAS VINCULADAS COMPONENT */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 font-sans">
                      <ExternalLink className="h-4 w-4 text-emerald-500" />
                      🔗 Bancas Vinculadas & Portais de Inscrição
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Acompanhe as áreas de inscrição oficial de cada banca. Clique para acessar o portal do candidato oficial e confirmar sua inscrição de concurso!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Display active bancas registered by the user */}
                    {activeBancasStats.map(b => (
                      <div key={b.name} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center font-mono shrink-0">
                              {b.name.slice(0, 3).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-bold text-xs text-slate-850 dark:text-slate-100 block truncate" title={b.name}>
                                {b.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {b.total} {b.total === 1 ? 'edital' : 'editais'} • {b.inscritos} {b.inscritos === 1 ? 'inscrito' : 'inscritos'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          {b.link ? (
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold text-center transition flex items-center justify-center gap-1"
                            >
                              Área do Candidato ↗
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/search?q=portal+do+candidato+concurso+banca+${encodeURIComponent(b.name)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 bg-slate-200/50 dark:bg-slate-800/80 hover:bg-slate-250 text-slate-650 dark:text-slate-400 rounded-lg text-[10px] font-bold text-center transition flex items-center justify-center gap-1"
                            >
                              Buscar Portal 🔍
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setFilterBanca(filterBanca === b.name ? 'Todos' : b.name);
                              setIsFilterPanelOpen(true);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer ${
                              filterBanca === b.name
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 shrink-0'
                            }`}
                            title="Filtrar por esta banca"
                          >
                            Filtrar
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pre-suggested Common Exam Portals if custom ones are not registered yet */}
                    {activeBancasStats.length < 4 && 
                      Object.entries(BANCA_LINKS)
                        .filter(([k]) => !activeBancasStats.some(ab => ab.name.toUpperCase().includes(k.toUpperCase())))
                        .slice(0, 4 - activeBancasStats.length)
                        .map(([k, uri]) => (
                          <div key={k} className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-900/10 flex flex-col justify-between space-y-3 opacity-75 hover:opacity-100 transition">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-extrabold text-xs flex items-center justify-center font-mono">
                                {k.slice(0, 3).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-705 dark:text-slate-400 block">
                                  Banca {k}
                                </span>
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  Sugestão de Banca
                                </span>
                              </div>
                            </div>
                            <a
                              href={uri}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold text-center transition flex items-center justify-center gap-1"
                            >
                              Acessar Página Oficial ↗
                            </a>
                          </div>
                      ))
                    }
                  </div>
                </div>

                {/* Search and Quick filters box */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    
                    {/* Search query field */}
                    <div className="relative w-full md:max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar por órgão, cargo, banca ou cidade..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>

                    {/* Left/Right controls */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition duration-150 w-full md:w-auto justify-center ${
                          isFilterPanelOpen 
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900' 
                            : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <SlidersHorizontal className="h-4 w-4" /> Filtros Avançados
                      </button>
                      
                      {/* Sorting dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl focus:outline-hidden font-semibold cursor-pointer w-full md:w-auto"
                      >
                        <option value="dataProvaAsc">Data Prova Crescente</option>
                        <option value="dataProvaDesc">Data Prova Decrescente</option>
                        <option value="salarioDesc">Salário Máximo</option>
                        <option value="salarioAsc">Salário Mínimo</option>
                        <option value="vagasDesc">Mais Vagas</option>
                        <option value="recent">Mais Recentes</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced Filters Panel Drawer */}
                  {isFilterPanelOpen && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-900/60 grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* State Select */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold font-mono text-slate-450 uppercase">UF / Estado</span>
                        <select
                          value={filterEstado}
                          onChange={(e) => setFilterEstado(e.target.value)}
                          className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-750 dark:text-slate-350 rounded-lg cursor-pointer focus:outline-hidden"
                        >
                          <option value="Todos">Todos</option>
                          {ESTADOS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Select */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold font-mono text-slate-450 uppercase">Status</span>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-150 text-slate-755 rounded-lg cursor-pointer focus:outline-hidden"
                          style={{ color: 'inherit' }}
                        >
                          <option value="Todos">Todos</option>
                          {Object.keys(STATUS_DATA).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {/* Banca Select */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold font-mono text-slate-450 uppercase">Banca</span>
                        <select
                          value={filterBanca}
                          onChange={(e) => setFilterBanca(e.target.value)}
                          className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-755 rounded-lg cursor-pointer focus:outline-hidden"
                          style={{ color: 'inherit' }}
                        >
                          <option value="Todos">Todos</option>
                          {bancaList.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      {/* Min Date Prova */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold font-mono text-slate-450 uppercase">Mín Data Prova</span>
                        <input
                          type="date"
                          value={filterDataMin}
                          onChange={(e) => setFilterDataMin(e.target.value)}
                          className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-750 dark:text-slate-350 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      {/* Max Date Prova */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold font-mono text-slate-450 uppercase">Máx Data Prova</span>
                        <input
                          type="date"
                          value={filterDataMax}
                          onChange={(e) => setFilterDataMax(e.target.value)}
                          className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-750 dark:text-slate-350 rounded-lg focus:outline-hidden"
                        />
                      </div>
                      
                      {/* Clean Filter triggers */}
                      <div className="md:col-span-5 flex justify-end">
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-250 transition cursor-pointer"
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConcursos.map((c) => {
                    const metadata = STATUS_DATA[c.status] || { label: c.status, bg: 'bg-slate-100 text-slate-800' };
                    return (
                      <div
                        key={c.id}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200 relative"
                      >
                        <div>
                          {/* State and Exam Status indicators */}
                          <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-855">
                            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono px-2.5 py-1 rounded-lg font-black uppercase">
                              UF: {c.estado} • {c.cidadeProva}
                            </span>
                            
                            <span className={`px-2.5 py-0.5 text-[9.5px] font-mono font-bold rounded-full border border-black/5 ${metadata.bg}`}>
                              {metadata.label}
                            </span>
                          </div>

                          {/* Main Title Description */}
                          <div className="mt-4">
                            <h3 className="text-base font-bold text-slate-950 dark:text-slate-50 tracking-tight leading-tight">
                              {c.orgao}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{c.cargo}</p>
                          </div>

                          {/* Salaries Vagas and Banca details */}
                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                              <span className="block text-[10px] text-slate-400 font-mono uppercase">Salário Mensal</span>
                              <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                                R$ {c.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                              <span className="block text-[10px] text-slate-400 font-mono uppercase">Vagas / Banca</span>
                              <span className="text-sm font-bold text-slate-850 dark:text-slate-100 font-mono truncate block">
                                {c.vagas} can | {c.banca}
                              </span>
                            </div>
                          </div>

                          {/* Cronograma indicators */}
                          <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between font-mono text-[10px] py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                              <span className="text-slate-400">Prova:</span>
                              <span className="font-bold text-rose-600 dark:text-rose-400">{formatBRLDate(c.dataProva)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px] py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                              <span className="text-slate-400">Pagar Taxa:</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">{formatBRLDate(c.dataPagamentoVencimento)}</span>
                            </div>
                            
                            {/* Tax Pay Toggle Button */}
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-400">Taxa (R$ {c.valorTaxa.toFixed(2)}):</span>
                              <button
                                onClick={() => toggleFeePaid(c.id, c.statusTaxa)}
                                className={`px-2.5 py-1 text-[9.5px] font-bold font-mono rounded-lg border transition duration-150 cursor-pointer ${
                                  c.statusTaxa === 'Paga'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-150'
                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-150 hover:bg-rose-100'
                                }`}
                              >
                                Taxa {c.statusTaxa}
                              </button>
                            </div>
                          </div>

                          {c.linkEdital && (
                            <a
                              href={c.linkEdital}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Ver Edital Completo
                            </a>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-1.5 no-print">
                          <button
                            onClick={() => {
                              setContestToEdit(c);
                              setIsModalOpen(true);
                            }}
                            className="p-1 px-2 text-xs rounded-lg border border-slate-150 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 font-semibold"
                            title="Editar Concurso"
                          >
                            <Edit className="h-3.5 w-3.5" /> Editar
                          </button>
                          
                          <button
                            onClick={() => handleDeleteContest(c.id)}
                            className="p-1.5 text-xs rounded-lg border border-rose-150 text-rose-600 hover:bg-rose-105 cursor-pointer"
                            title="Remover do Radar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredConcursos.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <Info className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-650 dark:text-slate-400">Nenhum concurso localizado</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-(--size-xs) mx-auto">
                        Tente reformular a pesquisa, remova parte de seus filtros rápidos ou cadastre um novo concurso no radar.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Beautiful Live Search panel */
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                  <div className="max-w-2xl">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      Pesquisar Concursos Públicos de Verdade via Google Grounding AI
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Digite o órgão ou cargo que deseja procurar. Nosso motor utiliza a inteligência artificial do Gemini integrada com o motor de <b>Busca do Google</b> para encontrar editais de verdade, extrair cargos, salários de junho de 2026, links oficiais e banca organizadora. Em seguida, você pode importá-los para sua conta de estudos imediatamente!
                    </p>
                  </div>

                  <form onSubmit={handleOnlineSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: Concursos abertos em SP, Concurso Correios 2026, Auditor Fiscal FGV, PC-MG..."
                        value={onlineQuery}
                        onChange={(e) => setOnlineQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={onlineLoading}
                      className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none transition shrink-0"
                    >
                      {onlineLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Pesquisando na Web...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" /> Pesquisar Editais
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sample prompt quick tags */}
                  <div className="flex flex-wrap gap-2 items-center text-xs pt-1">
                    <span className="text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold mr-1">Exemplos Rápidos:</span>
                    {[
                      'Concursos de TI abertos',
                      'Concursos previstos tribunais',
                      'Concurso do INSS 2026',
                      'Concursos abertos em SP',
                    ].map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setOnlineQuery(sug)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-650 dark:text-slate-350 rounded-lg transition border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading state */}
                {onlineLoading && (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div>
                      <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-650 dark:text-slate-400">Varrendo a Web de Verdade...</h4>
                      <p className="text-[11.5px] text-slate-450 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Consultando notícias públicas de portais, editais e diários oficiais atualizados de 2026. Isso pode levar alguns segundos.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error view */}
                {onlineError && (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-3xl space-y-2">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Erro na busca inteligente</h4>
                    <p className="text-xs leading-relaxed">{onlineError}</p>
                    <button
                      onClick={() => setOnlineError(null)}
                      className="text-xs text-indigo-650 dark:text-indigo-400 underline font-bold"
                    >
                      Limpar erro e tentar novamente
                    </button>
                  </div>
                )}

                {/* Fallback Warning Banner */}
                {!onlineLoading && !onlineError && onlineIsFallback && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-400 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        ⚠️ Busca Local de Editais Ativada (Fallback)
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed opacity-95">
                      {onlineFallbackDetails}
                    </p>
                    <div className="text-[10px] text-amber-600/90 dark:text-amber-400/80 leading-relaxed pt-1 border-t border-amber-500/10">
                      ℹ️ <b>Dica de Suporte</b>: Como o faturamento ou cota do seu projeto no Google AI Studio (https://ai.studio/projects) necessita de recarga ou ativação, o Radar ativou a <b>busca verídica offline</b>. O aplicativo continuará apto para buscar, planejar e importar os certames reais relativos ao seu filtro de pesquisa!
                    </div>
                  </div>
                )}

                {/* Results list dynamic cards */}
                {!onlineLoading && !onlineError && onlineResults.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-450 tracking-wider">
                        Resultados obtidos via Busca Google para: "{onlineQuery}"
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase font-mono">
                        Dados de Verdade (2026)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {onlineResults.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-1.5 bg-indigo-500 text-[8px] text-white font-mono uppercase font-black tracking-widest rounded-bl-xl">
                            REAL-TIME
                          </div>

                          <div>
                            {/* Header details */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-855">
                              <span className="text-[10.5px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-mono px-2 py-0.5 rounded-lg font-extrabold uppercase">
                                UF: {c.estado || 'BR'} • {c.cidadeProva || 'Geral'}
                              </span>
                              <span className="px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-lg text-indigo-700 dark:text-indigo-400 bg-indigo-500/10">
                                Live Search
                              </span>
                            </div>

                            {/* Contest Body */}
                            <div className="mt-4">
                              <h3 className="text-base font-bold text-slate-950 dark:text-slate-100 leading-tight">
                                {c.orgao}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">{c.cargo}</p>
                            </div>

                            {/* Details parameters */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                                <span className="block text-[9px] text-slate-400 font-mono uppercase">Salário</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white font-mono block truncate">
                                  R$ {(c.salario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                                <span className="block text-[9px] text-slate-400 font-mono uppercase">Banca / Vagas</span>
                                <span className="text-xs font-bold text-slate-850 dark:text-slate-155 font-mono block truncate">
                                  {c.vagas || 'CR'} v. • {c.banca || 'Própria'}
                                </span>
                              </div>
                            </div>

                            <p className="text-[10.5px] text-slate-650 dark:text-slate-400 leading-relaxed italic bg-indigo-500/5 p-2.5 rounded-xl mt-4">
                              {c.observacoes ? c.observacoes : 'Edital localizado recentemente com vagas de ótimo destaque.'}
                            </p>

                            <div className="mt-4 space-y-1.5 text-[10px] font-mono text-slate-400 border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-3">
                              <div className="flex justify-between">
                                <span>Data Prevista Prova:</span>
                                <span className="font-bold text-rose-500">{formatBRLDate(c.dataProva)}</span>
                              </div>
                              {c.dataInscricaoFechamento && (
                                <div className="flex justify-between">
                                  <span>Inscrições Encerram:</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-350">{formatBRLDate(c.dataInscricaoFechamento)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
                            {c.linkEdital && (
                              <a
                                href={c.linkEdital}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline self-start"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Acessar Link do Edital
                              </a>
                            )}

                            {getBancaLink(c.banca) && (
                              <a
                                href={getBancaLink(c.banca) || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-450 inline-flex items-center gap-1 hover:underline self-start mt-0.5"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Portal de Inscrições Banca ({c.banca})
                              </a>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                onClick={() => handleImportOnlineContest(c)}
                                className="flex items-center justify-center gap-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition duration-150 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" /> Salvar Interesse
                              </button>

                              <button
                                onClick={() => handleImportAndRegisterOnlineContest(c)}
                                className="flex items-center justify-center gap-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition duration-150 cursor-pointer shadow-xs"
                                title="Importa o concurso com status 'Inscrito' e abre o portal da banca"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Fazer Inscrição
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grounding references Sources UI */}
                    {onlineSources.length > 0 && (
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-3xl space-y-3">
                        <h5 className="text-[10px] font-bold font-mono text-indigo-750 dark:text-indigo-400 uppercase tracking-widest">
                          🔍 Fontes de Pesquisa Google Encontradas:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {onlineSources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 bg-white dark:bg-slate-950/40 hover:bg-indigo-50/50 dark:hover:bg-slate-900/70 text-xs text-slate-705 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition flex items-center justify-between border border-slate-150/40 dark:border-slate-800"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                <span className="truncate font-semibold text-[11px]">{src.title}</span>
                              </div>
                              <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty default state */}
                {!onlineLoading && !onlineError && onlineResults.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <Brain className="h-9 w-9 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-350">Pronto para Busca em Tempo Real</h4>
                    <p className="text-[11.5px] text-slate-450 mt-1 max-w-sm mx-auto leading-relaxed">
                      Digite o termo que deseja no campo acima e deixe que o Gemini + Google Grounding encontre os editais reais disponíveis!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. CALENDARIO VIEW */}
        {activeTab === 'calendario' && (
          <CalendarView concursos={concursos} />
        )}

        {/* 4. MAP VIEW */}
        {activeTab === 'mapa' && (
          <BrazilMap
            concursos={concursos}
            selectedEstado={filterEstado === 'Todos' ? null : filterEstado}
            onSelectEstado={(uf) => handleMapStateSelect(uf)}
          />
        )}

        {/* 5. FINACE VIEW */}
        {activeTab === 'financeiro' && (
          <FinanceDashboard concursos={concursos} />
        )}

        {/* 6. REPORTS PANEL VIEW */}
        {activeTab === 'relatorios' && (
          <ReportsPanel concursos={concursos} />
        )}

      </main>

      {/* PERSISTENT CRITICAL FOOTER */}
      <footer className="mt-auto py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-200 text-center text-xs text-slate-400 dark:text-slate-550 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Radar Concursos • Gerenciamento completo de editais de concursos públicos.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>Banco de Dados: Modo Offline Local</span>
            <span>Anchor context: Junho 2026</span>
          </div>
        </div>
      </footer>

      </div> {/* CLOSES CORE CONTENT SEGMENT WRAPPER */}

      {/* GLOBAL REGISTER & EDIT FORM MODAL CONTAINER */}
      <ContestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContest}
        concursoToEdit={contestToEdit}
      />

      {/* Floating Share Toast Notification */}
      {showShareToast && (
        <div id="share_toast_popup" className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white p-4 rounded-3xl shadow-2xl shadow-slate-950/50 max-w-sm flex gap-3 items-start animate-fade-in duration-300">
          <div className="p-1.5 bg-emerald-500 rounded-xl text-white shrink-0 mt-0.5">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Link Copiado!</h4>
            <p className="text-[11px] text-slate-300 leading-normal">
              O link do Radar foi copiado com sucesso. <b>Qualquer visitante que abrir este link acessará de forma direta sem solicitar login</b>; uma sessão local será criada automaticamente!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
