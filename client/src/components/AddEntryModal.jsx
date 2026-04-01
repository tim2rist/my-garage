import React, { useState } from 'react';
import { X, Fuel, Wrench, Settings, FileText, Loader2, Globe } from 'lucide-react';
import { useAuth, API_URL } from '../contexts/AuthContext';

const TYPE_CONFIG = {
  paliwo: { Icon: Fuel,     label: 'Paliwo',  activeClass: 'border-blue-500   bg-blue-50   dark:bg-blue-500/10   text-blue-600   dark:text-blue-400'   },
  serwis: { Icon: Wrench,   label: 'Serwis',  activeClass: 'border-amber-500  bg-amber-50  dark:bg-amber-500/10  text-amber-600  dark:text-amber-400'  },
  czesci: { Icon: Settings, label: 'Części',  activeClass: 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  inne:   { Icon: FileText, label: 'Inne',    activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};

function AddEntryModal({ isOpen, onClose, vehicleId, onSaved }) {
  const { authFetch } = useAuth();
  const [type,        setType]        = useState('paliwo');
  const [amount,      setAmount]      = useState('');
  const [description, setDescription] = useState('');
  const [mileage,     setMileage]     = useState('');
  const [isPublic,    setIsPublic]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setType('paliwo'); setAmount(''); setDescription('');
    setMileage(''); setIsPublic(false); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Podaj prawidłową kwotę (większą od 0)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API_URL}/api/vehicles/${vehicleId}/entries`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          amount:      parsed,
          description: description.trim() || null,
          mileage:     mileage ? parseInt(mileage) : null,
          is_public:   isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Błąd zapisu'); return; }
      reset();
      onSaved?.();
      onClose();
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nowy Wpis</h3>
          <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && <p className="text-sm text-rose-500 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-500/10 px-4 py-3 rounded-xl">{error}</p>}

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Kategoria</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    type === key
                      ? cfg.activeClass
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <cfg.Icon size={22} />
                  <span className="text-[10px] sm:text-xs font-bold">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kwota (PLN)</label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-4 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold tracking-tight"
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Przebieg (km) <span className="text-slate-400 font-normal">– opcjonalne</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder="np. 120 000"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Opis / Notatka</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="np. Wymiana oleju 5W-40 + filtr"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Publiczny wpis</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Widoczny dla innych w Społeczności</p>
              </div>
            </div>
            <button
              onClick={() => setIsPublic(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer focus:outline-none ${isPublic ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Zapisz Wpis'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEntryModal;
