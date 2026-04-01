import React, { useState, useEffect, useCallback } from 'react';
import { Fuel, Wrench, Settings, FileText, Loader2, Filter, Trash2, Globe } from 'lucide-react';
import { useAuth, API_URL } from '../contexts/AuthContext';

const TYPE_CONFIG = {
  paliwo: { label: 'Paliwo',  Icon: Fuel,     color: 'bg-blue-100   dark:bg-blue-500/20   text-blue-600   dark:text-blue-400'   },
  serwis: { label: 'Serwis',  Icon: Wrench,   color: 'bg-amber-100  dark:bg-amber-500/20  text-amber-600  dark:text-amber-400'  },
  czesci: { label: 'Części',  Icon: Settings, color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  inne:   { label: 'Inne',    Icon: FileText,  color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
};

const formatDate = (str) => new Date(str).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });

function ServiceHistory() {
  const { authFetch } = useAuth();
  const [vehicles,       setVehicles]       = useState([]);
  const [allEntries,     setAllEntries]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [typeFilter,     setTypeFilter]     = useState('wszystko');
  const [vehicleFilter,  setVehicleFilter]  = useState('wszystko');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const vRes = await authFetch(`${API_URL}/api/vehicles`);
      const vData = await vRes.json();
      setVehicles(vData);

      // Fetch all entries in parallel
      const entriesPerVehicle = await Promise.all(
        vData.map(v =>
          authFetch(`${API_URL}/api/vehicles/${v.id}/entries`)
            .then(r => r.json())
            .then(entries => entries.map(e => ({
              ...e,
              vehicleName: `${v.make} ${v.model}`,
              vehicleYear: v.year,
            })))
        )
      );
      const flat = entriesPerVehicle
        .flat()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllEntries(flat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (entryId) => {
    if (!confirm('Usunąć ten wpis?')) return;
    await authFetch(`${API_URL}/api/entries/${entryId}`, { method: 'DELETE' });
    setAllEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const filtered = allEntries.filter(e => {
    const t = typeFilter    === 'wszystko' || e.type       === typeFilter;
    const v = vehicleFilter === 'wszystko' || e.vehicle_id === parseInt(vehicleFilter);
    return t && v;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const TYPES = ['wszystko', 'paliwo', 'serwis', 'czesci', 'inne'];

  return (
    <div className="space-y-6">

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filtruj:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t === 'wszystko' ? 'Wszystko' : TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>

          {vehicles.length > 1 && (
            <select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value)}
              className="ml-auto bg-slate-100 dark:bg-slate-800 border-0 rounded-xl py-2 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="wszystko">Wszystkie pojazdy</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {filtered.length} wpis{filtered.length === 1 ? '' : filtered.length > 4 ? 'ów' : 'y'}
        </p>
        <p className="font-bold text-slate-800 dark:text-slate-100">
          Suma: <span className="text-blue-600 dark:text-blue-400">{total.toFixed(2)} PLN</span>
        </p>
      </div>

      {/* ── Entry list ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <FileText size={52} className="mx-auto mb-4 opacity-25" />
          <p className="text-lg font-semibold">Brak wpisów</p>
          <p className="text-sm mt-1">Dodaj pierwsze wpisy klikając „Dodaj Wpis" na Dashboardzie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.inne;
            return (
              <div
                key={entry.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Type icon */}
                <div className={`p-3 rounded-xl flex-shrink-0 ${cfg.color}`}>
                  <cfg.Icon size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{entry.vehicleName}</span>
                    {entry.is_public === 1 && (
                      <span className="text-xs text-blue-500 flex items-center gap-0.5">
                        <Globe size={10} /> publiczny
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium text-sm truncate">
                    {entry.description || `Wpis – ${cfg.label}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(entry.created_at)}</span>
                    {entry.mileage && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        📍 {entry.mileage.toLocaleString('pl-PL')} km
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount + delete */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-xl leading-tight">
                      {entry.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">PLN</p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Usuń wpis"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServiceHistory;
