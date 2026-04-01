import React, { useState, useEffect } from 'react';
import { Wrench, Mail, Lock, ArrowRight, CarFront, AtSign, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, API_URL } from '../contexts/AuthContext';

function Auth() {
  const { login } = useAuth();
  const [isLogin,       setIsLogin]       = useState(true);
  const [customId,      setCustomId]      = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isChecking,    setIsChecking]    = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  // Debounced ID availability check
  useEffect(() => {
    if (isLogin || customId.length < 3) { setIsIdAvailable(null); return; }
    const check = async () => {
      setIsChecking(true);
      try {
        const res  = await fetch(`${API_URL}/api/check-id/${customId}`);
        const data = await res.json();
        setIsIdAvailable(data.available);
      } catch { /* server offline – silently ignore */ }
      finally { setIsChecking(false); }
    };
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
  }, [customId, isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body     = isLogin
        ? { email, password }
        : { username: customId, email, password };

      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Coś poszło nie tak'); return; }
      login(data.token, data.user);
    } catch {
      setError('Nie można połączyć się z serwerem. Czy backend jest uruchomiony?');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setIsLogin(v => !v); setError(''); setCustomId(''); setIsIdAvailable(null); };
  const canSubmit  = isLogin
    ? (email && password)
    : (customId.length >= 3 && isIdAvailable === true && email && password);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-600/20 mb-4">
            <Wrench size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">MyGarage</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center font-medium">
            {isLogin ? 'Witaj z powrotem!' : 'Stwórz swój unikalny profil'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          {error && (
            <div className="mb-5 flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Unique ID – register only */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Twój Unikalny ID</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={customId}
                    onChange={e => setCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="np. miki_tuning"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-2xl py-4 pl-12 pr-12 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      isIdAvailable === true  ? 'border-emerald-500 focus:ring-emerald-500' :
                      isIdAvailable === false ? 'border-rose-500    focus:ring-rose-500'    :
                                               'border-slate-100 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isChecking          ? <Loader2     size={20} className="text-blue-500 animate-spin" /> :
                     isIdAvailable===true? <CheckCircle2 size={20} className="text-emerald-500" /> :
                     isIdAvailable===false? <XCircle    size={20} className="text-rose-500" />    : null}
                  </div>
                </div>
                {isIdAvailable === false && <p className="text-xs text-rose-500    ml-1 font-bold">To ID jest już zajęte!</p>}
                {isIdAvailable === true  && <p className="text-xs text-emerald-500 ml-1 font-bold">ID dostępne! 🎉</p>}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="twoj@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                !canSubmit || loading
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
              }`}
            >
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <>{isLogin ? 'Zaloguj się' : 'Utwórz konto'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}
              <button onClick={switchMode} className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
                {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
              </button>
            </p>
          </div>
        </div>

        <div className="flex justify-center text-slate-400 dark:text-slate-600 font-medium text-sm">
          <div className="flex items-center gap-1.5"><CarFront size={16} /><span>MyGarage PWA © 2026</span></div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
