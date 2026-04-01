import React, { useState } from 'react';
import { Search, Heart, Loader2, Car } from 'lucide-react';
import { API_URL } from '../contexts/AuthContext';

// Static gallery images for demo purposes
const GALLERY = [
  { img: 'https://images.unsplash.com/photo-1555353540-64fd1b19584d?auto=format&fit=crop&w=500&q=60', user: 'bmw_fanboy',   car: 'BMW E46 M3',  likes: 142 },
  { img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=60', user: 'drift_king',   car: 'Mazda MX-5',  likes: 98  },
  { img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=500&q=60', user: 'turbo_dave',   car: 'Subaru WRX',  likes: 211 },
  { img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=60', user: 'porsche_lover', car: 'Porsche 911',  likes: 374 },
  { img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=60', user: 'night_racer',  car: 'Honda NSX',   likes: 89  },
  { img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=500&q=60', user: 'miki_tuning',  car: 'Audi TT',     likes: 155 },
  { img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=500&q=60', user: 'stance_pl',    car: 'VW Golf GTI', likes: 63  },
  { img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=60', user: 'jdm_marek',    car: 'Toyota Supra', likes: 290 },
];

function Community() {
  const [query,         setQuery]         = useState('');
  const [searchResult,  setSearchResult]  = useState(null);
  const [searching,     setSearching]     = useState(false);
  const [searchError,   setSearchError]   = useState('');

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res  = await fetch(`${API_URL}/api/community/search/${trimmed}`);
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error || 'Nie znaleziono użytkownika'); return; }
      setSearchResult(data);
    } catch {
      setSearchError('Błąd połączenia z serwerem');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Search ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Znajdź projekt po ID</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Wpisz ID użytkownika (np. miki_tuning)"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : 'Szukaj'}
          </button>
        </div>

        {searchError && (
          <p className="mt-3 text-sm text-rose-500 dark:text-rose-400 font-medium">{searchError}</p>
        )}

        {/* Search result */}
        {searchResult && (
          <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
            {/* User header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl flex-shrink-0">
                {searchResult.user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-lg">@{searchResult.user.username}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {searchResult.vehicles.length} pojazd{searchResult.vehicles.length === 1 ? '' : searchResult.vehicles.length > 4 ? 'ów' : 'y'} w garażu
                </p>
              </div>
            </div>

            {/* Vehicles */}
            {searchResult.vehicles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {searchResult.vehicles.map(v => (
                  <div key={v.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <Car size={16} className="text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{v.make} {v.model}</p>
                      {v.year && <p className="text-xs text-slate-400 dark:text-slate-500">{v.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">Ten użytkownik nie ma jeszcze pojazdów.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Gallery ── */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 px-1">Galeria Społeczności</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {GALLERY.map((item, i) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-800"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                style={{ backgroundImage: `url(${item.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white min-w-0 mr-2">
                  <p className="text-sm font-bold truncate">@{item.user}</p>
                  <p className="text-xs text-slate-300 truncate">{item.car}</p>
                </div>
                <div className="flex items-center gap-1 text-rose-400 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full flex-shrink-0">
                  <Heart size={13} fill="currentColor" />
                  <span className="text-xs font-bold text-white">{item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Community;
