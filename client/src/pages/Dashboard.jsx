import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Wrench, Droplets, Plus, Trash2, Loader2 } from 'lucide-react';
import AddEntryModal   from '../components/AddEntryModal';
import AddVehicleModal from '../components/AddVehicleModal';
import { useAuth, API_URL } from '../contexts/AuthContext';

function Dashboard() {
  const { authFetch } = useAuth();
  const [vehicles,          setVehicles]          = useState([]);
  const [stats,             setStats]             = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [isEntryModalOpen,  setIsEntryModalOpen]  = useState(false);
  const [isVehicleModalOpen,setIsVehicleModalOpen]= useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        authFetch(`${API_URL}/api/vehicles`),
        authFetch(`${API_URL}/api/stats`),
      ]);
      setVehicles(await vRes.json());
      setStats(await sRes.json());
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEntryModal = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsEntryModalOpen(true);
  };

  const handleDeleteVehicle = async (vehicleId, vehicleName) => {
    if (!confirm(`Czy na pewno chcesz usunąć pojazd „${vehicleName}"?\nWszystkie wpisy tego pojazdu zostaną utracone.`)) return;
    await authFetch(`${API_URL}/api/vehicles/${vehicleId}`, { method: 'DELETE' });
    fetchData();
  };

  // Derived stats
  const monthlyTotal   = stats?.monthlyStats?.reduce((s, e) => s + e.total, 0) ?? 0;
  const fuelTotal      = stats?.monthlyStats?.find(e => e.type === 'paliwo')?.total  ?? 0;
  const serviceTotal   = stats?.monthlyStats?.find(e => e.type === 'serwis')?.total  ?? 0;
  const partsTotal     = stats?.monthlyStats?.find(e => e.type === 'czesci')?.total  ?? 0;

  return (
    <>
      <div className="space-y-8">

        {/* ── Monthly stats banner ── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900 p-6 md:p-8 rounded-3xl shadow-lg shadow-blue-900/20 dark:shadow-none text-white relative overflow-hidden transition-colors">
          <div className="absolute -right-10 -top-10 bg-white/20 dark:bg-white/5 w-64 h-64 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-blue-100 dark:text-slate-400 text-sm md:text-base font-medium mb-1 relative z-10">
            Wydatki w tym miesiącu
          </h3>
          <p className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
            {monthlyTotal.toFixed(2)}{' '}
            <span className="text-xl md:text-2xl text-blue-200 dark:text-slate-500 font-medium">PLN</span>
          </p>
          <div className="flex flex-wrap gap-3 relative z-10">
            {fuelTotal > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 dark:bg-slate-700/50 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 dark:border-slate-700">
                <Droplets size={16} className="text-blue-200 dark:text-blue-400" />
                Paliwo: {fuelTotal.toFixed(2)} PLN
              </div>
            )}
            {serviceTotal > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 dark:bg-slate-700/50 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 dark:border-slate-700">
                <Wrench size={16} className="text-amber-300 dark:text-amber-400" />
                Serwis: {serviceTotal.toFixed(2)} PLN
              </div>
            )}
            {partsTotal > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 dark:bg-slate-700/50 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 dark:border-slate-700">
                <Settings size={16} className="text-purple-300 dark:text-purple-400" />
                Części: {partsTotal.toFixed(2)} PLN
              </div>
            )}
            {monthlyTotal === 0 && (
              <p className="text-blue-200 dark:text-slate-500 text-sm">Brak wpisów w tym miesiącu</p>
            )}
          </div>
        </div>

        {/* ── Vehicles ── */}
        <div>
          <div className="flex justify-between items-end mb-6 px-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Twoje Pojazdy</h3>
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {vehicles.length} pojazd{vehicles.length === 1 ? '' : vehicles.length > 4 ? 'ów' : 'y'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={36} className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map(car => (
                <div
                  key={car.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 xl:hover:-translate-y-1 flex flex-col"
                >
                  {/* Car photo */}
                  <div className="relative h-56 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    {car.image_url ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: `url(${car.image_url})` }}
                      ></div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Wrench size={56} className="text-slate-500" />
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5 z-20 text-white">
                      <h4 className="text-2xl font-bold leading-tight">{car.make} {car.model}</h4>
                      {car.year && <p className="text-sm text-slate-300 font-medium mt-1">{car.year}</p>}
                    </div>
                    {/* Delete button – visible on hover */}
                    <button
                      onClick={() => handleDeleteVehicle(car.id, `${car.make} ${car.model}`)}
                      className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                      title="Usuń pojazd"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Stats + action */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col items-start">
                        <span className="text-slate-400 dark:text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">Wpisy</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-1.5">
                          <Settings size={16} className="text-slate-400" /> {car.entry_count ?? 0}
                        </span>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-400 dark:text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">Wydatki ogółem</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">
                          {(car.total_expenses ?? 0).toFixed(2)} PLN
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openEntryModal(car.id)}
                      className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex justify-center items-center gap-2 cursor-pointer mt-auto"
                    >
                      <Plus size={18} /> Dodaj Wpis
                    </button>
                  </div>
                </div>
              ))}

              {/* Add vehicle card */}
              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="w-full min-h-[350px] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-3xl font-semibold hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-center items-center gap-3"
              >
                <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">
                  <Plus size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <span>Dodaj nowy pojazd</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AddEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        vehicleId={selectedVehicleId}
        onSaved={fetchData}
      />
      <AddVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSaved={fetchData}
      />
    </>
  );
}

export default Dashboard;
