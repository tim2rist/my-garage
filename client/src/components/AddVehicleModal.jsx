import React, { useState, useRef } from 'react';
import { X, Loader2, Upload, ImageIcon } from 'lucide-react';
import { useAuth, API_URL } from '../contexts/AuthContext';

const CAR_MAKES = [
  'Alfa Romeo','Audi','BMW','Chevrolet','Citroën','Dacia','Fiat','Ford',
  'Honda','Hyundai','Kia','Mazda','Mercedes-Benz','Mini','Mitsubishi',
  'Nissan','Opel','Peugeot','Renault','Seat','Skoda','Subaru','Suzuki',
  'Toyota','Volkswagen','Volvo',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);

function AddVehicleModal({ isOpen, onClose, onSaved }) {
  const { authFetch, token } = useAuth();
  const fileRef = useRef(null);

  const [make,       setMake]       = useState('');
  const [model,      setModel]      = useState('');
  const [year,       setYear]       = useState('');
  const [imageUrl,   setImageUrl]   = useState('');
  const [imageKey,   setImageKey]   = useState('');   // S3 key (if uploaded)
  const [imgError,   setImgError]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [urlMode,    setUrlMode]    = useState(false); // toggle between file / URL

  if (!isOpen) return null;

  const reset = () => {
    setMake(''); setModel(''); setYear('');
    setImageUrl(''); setImageKey('');
    setError(''); setImgError(false);
    setUrlMode(false); setUploading(false);
  };
  const handleClose = () => { reset(); onClose(); };

  // ── Upload file to /api/upload/image → get back a URL ──────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const res  = await fetch(`${API_URL}/api/upload/image`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Błąd przesyłania zdjęcia'); return; }
      setImageUrl(data.url);
      setImageKey(data.key || '');
      setImgError(false);
    } catch {
      setError('Błąd połączenia podczas przesyłania zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  // ── Save vehicle ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!make || !model) { setError('Marka i model są wymagane'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        body:   JSON.stringify({
          make,
          model,
          year:      year      ? parseInt(year)  : null,
          image_url: imageUrl.trim() || null,
          image_key: imageKey  || null,
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

  const canSave = make && model && !uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nowy Pojazd</h3>
          <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <p className="text-sm text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 px-4 py-3 rounded-xl">{error}</p>
          )}

          {/* Make */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Marka *</label>
            <select
              value={make}
              onChange={e => setMake(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Wybierz markę...</option>
              {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="__other">Inna...</option>
            </select>
            {make === '__other' && (
              <input
                type="text"
                placeholder="Wpisz markę"
                onChange={e => setMake(e.target.value || '__other')}
                className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Model *</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="np. Golf GTI, E46 M3, MX-5 NC"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rok produkcji</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Wybierz rok...</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Image – file upload OR URL paste */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Zdjęcie <span className="text-slate-400 font-normal">– opcjonalne</span>
              </label>
              <button
                type="button"
                onClick={() => { setUrlMode(v => !v); setImageUrl(''); setImageKey(''); setImgError(false); }}
                className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                {urlMode ? '← Prześlij plik' : 'Wklej URL →'}
              </button>
            </div>

            {urlMode ? (
              /* URL paste mode */
              <>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setImgError(false); setImageKey(''); }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Tip: skorzystaj z <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">Unsplash</a> lub wklej bezpośredni link do zdjęcia.
                </p>
              </>
            ) : (
              /* File upload mode */
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-60"
                >
                  {uploading
                    ? <><Loader2 size={18} className="animate-spin" /> Przesyłanie...</>
                    : <><Upload size={18} /> Kliknij aby przesłać zdjęcie (max 5 MB)</>
                  }
                </button>
              </>
            )}

            {/* Preview */}
            {imageUrl && !imgError && (
              <div className="mt-3 rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={imageUrl}
                  alt="Podgląd"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
                <button
                  type="button"
                  onClick={() => { setImageUrl(''); setImageKey(''); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {imgError && (
              <div className="mt-3 flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <ImageIcon size={16} />
                <p className="text-xs">Nie można załadować podglądu – sprawdź URL.</p>
              </div>
            )}
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
            disabled={loading || !canSave}
            className="flex-1 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Dodaj Pojazd'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddVehicleModal;
