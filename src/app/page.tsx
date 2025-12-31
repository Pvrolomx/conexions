'use client';

import { useState } from 'react';

interface Contacto {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  etiquetas: string;
  nivel: number;
  ubicacion: string | null;
  comoNosConocimos: string | null;
  notas: string | null;
  confidencial: boolean;
}

interface Gestion {
  id: string;
  contactoId: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  estado: string;
  contacto?: Contacto;
}

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  ubicacion: string | null;
}

const ETIQUETAS = ['familia', 'trabajo', 'gobierno', 'negocios', 'amigos', 'otro'];
const UBICACIONES = ['Jalisco', 'Nayarit', 'CDMX', 'Otro'];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);
  const [showContactoForm, setShowContactoForm] = useState(false);
  const [showGestionForm, setShowGestionForm] = useState(false);
  const [gestionContactoId, setGestionContactoId] = useState('');
  const [gestionData, setGestionData] = useState({ tipo: 'apoyo_dado', descripcion: '', notas: '' });
  const [contactoData, setContactoData] = useState({
    nombre: '', telefono: '', email: '', etiquetas: [] as string[],
    nivel: 3, ubicacion: '', comoNosConocimos: '', notas: '', confidencial: false
  });

  const loadContactos = async (confidencial = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contactos');
      const data = await res.json();
      setContactos((data || []).filter((c: Contacto) => c.confidencial === confidencial));
    } catch { setContactos([]); }
    setLoading(false);
  };

  const loadGestiones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gestiones');
      setGestiones(await res.json() || []);
    } catch { setGestiones([]); }
    setLoading(false);
  };

  const loadEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eventos');
      setEventos(await res.json() || []);
    } catch { setEventos([]); }
    setLoading(false);
  };

  const handleSectionClick = async (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      if (section === 'confidencial' && !pinVerified) {
        setPinModal(true);
        return;
      }
      setActiveSection(section);
      if (section === 'contactos') await loadContactos(false);
      if (section === 'confidencial') await loadContactos(true);
      if (section === 'gestiones') await loadGestiones();
      if (section === 'agenda') await loadEventos();
    }
  };

  const verifyPin = () => {
    if (pinInput.length >= 4) {
      setPinVerified(true);
      setPinModal(false);
      setActiveSection('confidencial');
      loadContactos(true);
    } else {
      alert('PIN debe tener al menos 4 dígitos');
    }
    setPinInput('');
  };

  const createContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/contactos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...contactoData, 
        etiquetas: JSON.stringify(contactoData.etiquetas),
        confidencial: activeSection === 'confidencial'
      })
    });
    setShowContactoForm(false);
    setContactoData({ nombre: '', telefono: '', email: '', etiquetas: [], nivel: 3, ubicacion: '', comoNosConocimos: '', notas: '', confidencial: false });
    if (activeSection === 'contactos') await loadContactos(false);
    if (activeSection === 'confidencial') await loadContactos(true);
  };

  const createGestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/gestiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...gestionData, contactoId: gestionContactoId })
    });
    setShowGestionForm(false);
    setGestionData({ tipo: 'apoyo_dado', descripcion: '', notas: '' });
    setGestionContactoId('');
    await loadGestiones();
  };

  const openGestionForm = (contactoId: string) => {
    setGestionContactoId(contactoId);
    setShowGestionForm(true);
    setSelectedContacto(null);
  };

  const renderStars = (nivel: number) => '★'.repeat(nivel) + '☆'.repeat(5 - nivel);
  const parseEtiquetas = (etiquetas: string): string[] => {
    try { return JSON.parse(etiquetas); } catch { return []; }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 pt-6 pb-4 px-6">
        <div className="max-w-lg mx-auto text-center">
          <img src="/logo.png" alt="Conexions" className="h-36 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Conexiones que importan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {!activeSection ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Contactos */}
            <button onClick={() => handleSectionClick('contactos')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-contactos.png" alt="Contactos" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Contactos</span>
                <span className="text-stone-400 text-xs">Tu red principal</span>
              </div>
            </button>

            {/* Confidencial */}
            <button onClick={() => handleSectionClick('confidencial')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-confidencial.png" alt="Confidencial" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Confidencial</span>
                <span className="text-stone-400 text-xs">Acceso con PIN</span>
              </div>
            </button>

            {/* Gestiones */}
            <button onClick={() => handleSectionClick('gestiones')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-gestiones.png" alt="Gestiones" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Gestiones</span>
                <span className="text-stone-400 text-xs">Apoyos y favores</span>
              </div>
            </button>

            {/* Agenda */}
            <button onClick={() => handleSectionClick('agenda')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-agenda.png" alt="Agenda" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Agenda</span>
                <span className="text-stone-400 text-xs">Eventos y citas</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <button onClick={() => setActiveSection(null)}
              className="mb-4 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition">
              <span>←</span> <span>Volver</span>
            </button>

            {/* Contactos / Confidencial Section */}
            {(activeSection === 'contactos' || activeSection === 'confidencial') && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                      activeSection === 'confidencial' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {activeSection === 'confidencial' ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-stone-800">
                      {activeSection === 'confidencial' ? '🔒 Confidencial' : 'Contactos'}
                    </h2>
                  </div>
                  <button onClick={() => setShowContactoForm(true)} 
                    className={`px-4 py-2 rounded-xl font-medium text-sm shadow-md transition text-white ${
                      activeSection === 'confidencial' ? 'bg-gradient-to-b from-red-500 to-red-600' : 'bg-gradient-to-b from-blue-500 to-blue-600'
                    }`}>
                    + Nuevo
                  </button>
                </div>
                
                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : contactos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500">No hay contactos</p>
                    <button onClick={() => setShowContactoForm(true)} 
                      className={`font-medium mt-2 inline-block hover:underline ${activeSection === 'confidencial' ? 'text-red-500' : 'text-blue-500'}`}>
                      Agregar primero
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {contactos.map(c => (
                      <div key={c.id} onClick={() => setSelectedContacto(c)}
                        className="p-4 bg-stone-50 hover:bg-blue-50 rounded-xl transition border border-stone-100 hover:border-blue-200 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-stone-800">{c.nombre}</p>
                            <p className="text-sm text-stone-500">{c.telefono}</p>
                            <p className="text-blue-500 text-sm">{renderStars(c.nivel)}</p>
                          </div>
                          <div className="text-right">
                            {c.ubicacion && <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded">{c.ubicacion}</span>}
                            <div className="flex gap-1 mt-2 flex-wrap justify-end">
                              {parseEtiquetas(c.etiquetas).map(et => (
                                <span key={et} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">{et}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gestiones Section */}
            {activeSection === 'gestiones' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-stone-800">Gestiones</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{gestiones.filter(g => g.tipo === 'apoyo_dado').length}</p>
                    <p className="text-emerald-500 text-xs">Dados</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{gestiones.filter(g => g.tipo === 'apoyo_recibido').length}</p>
                    <p className="text-blue-500 text-xs">Recibidos</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{gestiones.filter(g => g.estado === 'abierto').length}</p>
                    <p className="text-amber-500 text-xs">Pendientes</p>
                  </div>
                </div>

                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : gestiones.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500">No hay gestiones</p>
                    <p className="text-stone-400 text-sm mt-1">Agrega una desde un contacto</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {gestiones.map(g => (
                      <div key={g.id} className={`p-4 rounded-xl border ${
                        g.tipo === 'apoyo_dado' ? 'bg-emerald-50 border-emerald-200' :
                        g.tipo === 'apoyo_recibido' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-stone-800 font-medium">{g.descripcion}</p>
                            <p className="text-stone-500 text-sm">{g.contacto?.nombre}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            g.estado === 'abierto' ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'
                          }`}>{g.estado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Agenda Section */}
            {activeSection === 'agenda' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-stone-800">Agenda</h2>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-md">
                    + Evento
                  </button>
                </div>

                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : eventos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500">No hay eventos</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {eventos.map(e => (
                      <div key={e.id} className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <p className="text-stone-800 font-medium">{e.titulo}</p>
                        <p className="text-purple-500 text-sm">{new Date(e.fecha).toLocaleDateString()}</p>
                        {e.ubicacion && <p className="text-stone-500 text-sm">📍 {e.ubicacion}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-2 opacity-30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </div>
          <p className="text-stone-400 text-sm">Hecho por <span className="text-blue-500">Colmena (C6)</span> • 2025</p>
        </footer>
      </main>

      {/* PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-stone-200 shadow-xl">
            <h2 className="text-xl font-bold text-stone-800 mb-4 text-center">🔒 Acceso Confidencial</h2>
            <input type="password" placeholder="Ingresa PIN" value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-center text-2xl tracking-widest mb-4" />
            <div className="flex gap-2">
              <button onClick={verifyPin} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold">Verificar</button>
              <button onClick={() => { setPinModal(false); setPinInput(''); }} className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Contacto Form Modal */}
      {showContactoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-stone-800 mb-4">
              {activeSection === 'confidencial' ? '🔒 Nuevo Contacto Confidencial' : 'Nuevo Contacto'}
            </h2>
            <form onSubmit={createContacto} className="space-y-4">
              <input required placeholder="Nombre completo" value={contactoData.nombre}
                onChange={e => setContactoData({...contactoData, nombre: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
              <input required placeholder="Teléfono" value={contactoData.telefono}
                onChange={e => setContactoData({...contactoData, telefono: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
              <input placeholder="Email (opcional)" type="email" value={contactoData.email}
                onChange={e => setContactoData({...contactoData, email: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
              <select value={contactoData.ubicacion} onChange={e => setContactoData({...contactoData, ubicacion: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
                <option value="">Ubicación</option>
                {UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div>
                <label className="text-stone-500 text-sm mb-2 block">Nivel de importancia</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setContactoData({...contactoData, nivel: n})}
                      className={`text-3xl ${contactoData.nivel >= n ? 'text-blue-500' : 'text-stone-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-stone-500 text-sm mb-2 block">Etiquetas</label>
                <div className="flex gap-2 flex-wrap">
                  {ETIQUETAS.map(et => (
                    <button key={et} type="button"
                      onClick={() => {
                        const etqs = contactoData.etiquetas.includes(et)
                          ? contactoData.etiquetas.filter(e => e !== et)
                          : [...contactoData.etiquetas, et];
                        setContactoData({...contactoData, etiquetas: etqs});
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        contactoData.etiquetas.includes(et) ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                      {et}
                    </button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Cómo nos conocimos" value={contactoData.comoNosConocimos}
                onChange={e => setContactoData({...contactoData, comoNosConocimos: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" rows={2} />
              <textarea placeholder="Notas" value={contactoData.notas}
                onChange={e => setContactoData({...contactoData, notas: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" rows={3} />
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold">Guardar</button>
                <button type="button" onClick={() => setShowContactoForm(false)} className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacto Detail Modal */}
      {selectedContacto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedContacto(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">{selectedContacto.nombre}</h2>
                <p className="text-blue-500">{renderStars(selectedContacto.nivel)}</p>
              </div>
              {selectedContacto.confidencial && <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">🔒</span>}
            </div>
            <div className="space-y-3">
              <a href={`tel:${selectedContacto.telefono}`} className="flex items-center gap-3 text-stone-800 hover:text-blue-500 p-3 bg-stone-50 rounded-xl">
                📞 {selectedContacto.telefono}
              </a>
              {selectedContacto.email && (
                <a href={`mailto:${selectedContacto.email}`} className="flex items-center gap-3 text-stone-800 hover:text-blue-500 p-3 bg-stone-50 rounded-xl">
                  ✉️ {selectedContacto.email}
                </a>
              )}
              {selectedContacto.ubicacion && (
                <p className="flex items-center gap-3 text-stone-600 p-3 bg-stone-50 rounded-xl">📍 {selectedContacto.ubicacion}</p>
              )}
              {selectedContacto.comoNosConocimos && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-stone-400 text-sm mb-1">Cómo nos conocimos:</p>
                  <p className="text-stone-800">{selectedContacto.comoNosConocimos}</p>
                </div>
              )}
              {selectedContacto.notas && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-stone-400 text-sm mb-1">Notas:</p>
                  <p className="text-stone-800">{selectedContacto.notas}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => openGestionForm(selectedContacto.id)} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-semibold">+ Gestión</button>
              <button className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold">Editar</button>
              <button onClick={() => setSelectedContacto(null)} className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Gestion Form Modal */}
      {showGestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-stone-800 mb-4">Nueva Gestión</h2>
            <form onSubmit={createGestion} className="space-y-4">
              <select value={gestionData.tipo} onChange={e => setGestionData({...gestionData, tipo: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl">
                <option value="apoyo_dado">Apoyo Dado</option>
                <option value="apoyo_recibido">Apoyo Recibido</option>
                <option value="pendiente">Pendiente</option>
              </select>
              <textarea required placeholder="Descripción" value={gestionData.descripcion}
                onChange={e => setGestionData({...gestionData, descripcion: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" rows={3} />
              <textarea placeholder="Notas (opcional)" value={gestionData.notas}
                onChange={e => setGestionData({...gestionData, notas: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" rows={2} />
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-semibold">Guardar</button>
                <button type="button" onClick={() => setShowGestionForm(false)} className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
