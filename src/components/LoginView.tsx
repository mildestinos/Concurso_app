import React, { useState } from 'react';
import { Mail, Lock, Sparkles, Brain, ArrowRight, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (email: string, userName: string) => void;
  defaultEmail?: string;
}

export default function LoginView({ onLoginSuccess, defaultEmail = 'adm.esv@gmail.com' }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Administrador');
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (isSignUp && !name) {
      setError('Por favor, digite o seu nome.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingType('email');

    // Simulate authentication lag
    setTimeout(() => {
      setLoading(false);
      setLoadingType(null);
      const finalName = isSignUp ? name : (email.split('@')[0].replace('.', ' ') || 'Usuário');
      onLoginSuccess(email, finalName);
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setLoading(true);
    setLoadingType('google');

    setTimeout(() => {
      setLoading(false);
      setLoadingType(null);
      // Fulfilling Google login with current environment user
      onLoginSuccess(defaultEmail, 'Adm. Radar');
    }, 1200);
  };

  const autofillUser = (role: 'admin' | 'guest') => {
    setError(null);
    if (role === 'admin') {
      setEmail(defaultEmail);
      setName('Administrador');
      setPassword('admin123');
    } else {
      setEmail('concurseiro@radar.com');
      setName('Junior Silva');
      setPassword('senha123');
    }
  };

  return (
    <div id="login_screen_container" className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col items-center justify-center p-4 transition-colors duration-200">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-slate-150 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none p-8 relative z-10 transition-colors duration-200">
        
        {/* App Logo Indicator */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center ring-4 ring-blue-500/10">
            <Brain className="h-7 w-7 stroke-[1.8] animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
              Radar Concursos
            </span>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-mono font-bold tracking-widest uppercase mt-1">SaaS de Preparação</p>
          </div>
        </div>

        {/* Dynamic Header Titles */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {isSignUp ? 'Criar nova conta de estudante' : 'Acesse seu painel executivo'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSignUp 
              ? 'Inscreva-se hoje para organizar editais e provas!'
              : 'Faça login com seu e-mail ou Gmail para continuar.'}
          </p>
        </div>

        {/* Predefined Quick Login Targets for convenience */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Acesso Rápido:</span>
          <div className="flex gap-2">
            <button
              type="button"
              id="autofill_admin_btn"
              onClick={() => autofillUser('admin')}
              className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 hover:bg-blue-150 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg cursor-pointer transition"
            >
              Gmail (adm.esv)
            </button>
            <button
              type="button"
              id="autofill_guest_btn"
              onClick={() => autofillUser('guest')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-200/70 hover:bg-slate-250 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg cursor-pointer transition"
            >
              Outro E-mail
            </button>
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div id="login_error" className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-655 dark:text-red-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading overlay overlay block */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-[#1E293B]/80 rounded-3xl backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                {loadingType === 'google' ? 'Sincronizando com Google...' : 'Iniciando painel...'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Isolando sandbox seguro local</p>
            </div>
          </div>
        )}

        {/* Unified Authentication form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold font-mono text-slate-455 dark:text-slate-400 uppercase tracking-widest">Seu Nome completo</label>
              <div className="relative">
                <input
                  id="signup_name_input"
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-220 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold font-mono text-slate-455 dark:text-slate-400 uppercase tracking-widest">Endereço de E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="login_email_input"
                type="email"
                placeholder="Ex: seu-email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-220 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold font-mono text-slate-455 dark:text-slate-400 uppercase tracking-widest">Sua Senha de Acesso</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    alert(`Um simulador de link de redefinição foi disparado para: ${email}. Verifique a caixa de entrada.`);
                  }}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="login_password_input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-220 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Core Submit Button */}
          <button
            type="submit"
            id="login_submit_btn"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-650 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl tracking-tight shadow-md shadow-blue-500/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition"
          >
            {isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" /> Cadastrar-se agora
              </>
            ) : (
              <>
                Entrar no Radar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* OR Divider section */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-150 dark:border-slate-800/60"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-mono">ou continue com</span>
          <div className="flex-grow border-t border-slate-150 dark:border-slate-800/60"></div>
        </div>

        {/* Social Button: Sign-in with Google/Gmail explicitly */}
        <button
          type="button"
          id="google_signin_btn"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 py-3 border border-slate-220 dark:border-slate-850 bg-white hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          {/* Custom structured Chrome/Google icon layout utilizing pure CSS and lucide globe */}
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com sua conta Gmail / Google
        </button>

        {/* Toggle Account Creation Trigger */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>{isSignUp ? 'Já possui login cadastrado?' : 'Primeira vez no Radar?'} </span>
          <button
            type="button"
            id="toggle_signup_btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Fazer login' : 'Criar uma conta grátis'}
          </button>
        </div>

        {/* Explaining sandbox isolation of records */}
        <p className="text-[9px] text-slate-400 text-center font-mono mt-6 leading-relaxed">
          🔒 Cada e-mail possui um painel com dados persistidos locais exclusivos sob isolamento sandbox de chaves.
        </p>

      </div>
    </div>
  );
}
