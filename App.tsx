
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Person, Gender, NumerologyResults, MaritalStatus, LifeEvent, EventType, RelationshipType } from './types';
import { calculateNumerology } from './utils/numerology';
import { SEFIROT, EVENT_SYMBOLS } from './constants';
import { getGeminiAnalysis } from './services/geminiService';
import { exportToPDF } from './utils/pdfExport';
import { exportToCSV, importFromCSV } from './utils/csvExport';

// --- Sub-components ---

const FlexibleDateInput: React.FC<{
  day?: string;
  month?: string;
  year?: string;
  onChange: (field: 'day' | 'month' | 'year', value: string) => void;
  label?: string;
}> = ({ day, month, year, onChange, label }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">{label}</label>}
      <div className="flex gap-2">
        <select
          value={day || ''}
          onChange={(e) => onChange('day', e.target.value)}
          className="flex-1 bg-white/50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-condensed focus:bg-white"
        >
          <option value="">Día</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
          ))}
        </select>
        <select
          value={month || ''}
          onChange={(e) => onChange('month', e.target.value)}
          className="flex-1 bg-white/50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-condensed focus:bg-white"
        >
          <option value="">Mes</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={String(m).padStart(2, '0')}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Año (opc.)"
          value={year || ''}
          onChange={(e) => onChange('year', e.target.value)}
          className="flex-[1.5] bg-white/50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-condensed placeholder:text-slate-400 focus:bg-white"
        />
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; id?: string }> = ({ title, children, icon, id }) => (
  <div id={id} className="glass-card rounded-[2rem] p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 group">
    <div className="flex items-center gap-4 mb-6">
      {icon && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl transition-transform group-hover:scale-110 shadow-sm">{icon}</div>}
      <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const Navbar: React.FC<{ activeTab: string; setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile', label: 'Mi Perfil' },
    { id: 'family', label: 'Relaciones' },
    { id: 'numerology', label: 'Numerología' },
    { id: 'cabala', label: 'Cábala' },
    { id: 'tikun', label: 'Tikún & Análisis' },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-emerald-100 px-4 py-4 no-print">
      <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-2 md:gap-4 justify-center">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<Person>({
    id: 'user',
    firstName: '',
    lastName: '',
    nicknames: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    birthDate: '0000-00-00',
    birthTime: '',
    birthPlace: '',
    gender: Gender.OTHER,
    maritalStatus: MaritalStatus.SINGLE,
    religion: '',
    profession: '',
    formation: '',
    characteristics: '',
    events: [],
    relationshipType: 'SELF' as any
  });
  const [family, setFamily] = useState<Person[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numerology = useMemo(() => {
    if (user.firstName && user.birthDay && user.birthMonth) {
      const bDate = `${user.birthYear || '0000'}-${user.birthMonth}-${user.birthDay}`;
      return calculateNumerology(`${user.firstName} ${user.lastName}`, bDate);
    }
    return null;
  }, [user]);

  const handleAddFamilyMember = () => {
    const newMember: Person = {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      birthDate: '0000-00-00',
      gender: Gender.MALE,
      relationshipType: RelationshipType.PARENT,
      events: [],
      characteristics: '',
    };
    setFamily([...family, newMember]);
  };

  const updateFamilyMember = (id: string, field: keyof Person, value: any) => {
    setFamily(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        const bDate = `${updated.birthYear || '0000'}-${updated.birthMonth || '00'}-${updated.birthDay || '00'}`;
        updated.birthDate = bDate;
        return updated;
      }
      return m;
    }));
  };

  const handleUserDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    const updated = { ...user };
    if (field === 'day') updated.birthDay = value;
    if (field === 'month') updated.birthMonth = value;
    if (field === 'year') updated.birthYear = value;
    updated.birthDate = `${updated.birthYear || '0000'}-${updated.birthMonth || '00'}-${updated.birthDay || '00'}`;
    setUser(updated);
  };

  const generateDeepAnalysis = async () => {
    if (!user.firstName || !user.birthDay || !numerology) return;
    setLoading(true);
    const result = await getGeminiAnalysis(user, numerology, family);
    setAnalysis(result || '');
    setLoading(false);
    setActiveTab('tikun');
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setTimeout(async () => {
      await exportToPDF('report-container', `Reporte_Arbol_Vida_${user.firstName}`);
      setExporting(false);
    }, 100);
  };

  const handleCsvExport = () => exportToCSV(user, family);
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importFromCSV(event.target?.result as string);
      if (result) {
        setUser(result.user);
        setFamily(result.family);
        alert('Datos importados correctamente.');
      }
    };
    reader.readAsText(file);
  };

  const TreeVisualization = ({ numerologyPath }: { numerologyPath?: number | null }) => (
    <div className="relative w-80 h-[600px] mx-auto scale-90 sm:scale-100 origin-top py-10">
      {SEFIROT.map((s) => {
        const positions: Record<number, {t: number, l?: number, r?: number, c?: boolean}> = {
          1: { t: 0, c: true }, 2: { t: 80, r: 80 }, 3: { t: 80, l: 80 }, 4: { t: 180, r: 80 },
          5: { t: 180, l: 80 }, 6: { t: 220, c: true }, 7: { t: 340, r: 80 }, 8: { t: 340, l: 80 },
          9: { t: 400, c: true }, 10: { t: 500, c: true },
        };
        const pos = positions[s.id];
        const style: React.CSSProperties = { top: pos.t };
        if (pos.c) style.left = '50%', style.transform = 'translateX(-50%)';
        else if (pos.l) style.left = '0';
        else if (pos.r) style.right = '0';

        const isUserPath = numerologyPath === s.id;

        return (
          <div key={s.id} 
            className={`absolute w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-500 ${isUserPath ? 'ring-8 ring-cyan-200/50 scale-125' : 'opacity-80'}`}
            style={{ 
              ...style,
              borderColor: s.color.includes('/') ? '#0d9488' : s.color.toLowerCase(), 
              backgroundColor: 'white',
              boxShadow: isUserPath ? `0 0 30px rgba(6, 182, 212, 0.4)` : '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <span className="text-[10px] text-emerald-800 font-extrabold opacity-50">{s.id}</span>
            <span className="text-xs font-bold text-slate-800 leading-none">{s.hebrewName}</span>
          </div>
        )
      })}
      <svg className="absolute inset-0 w-full h-full -z-10 opacity-20" viewBox="0 0 320 600">
        <path d="M160,32 L80,112 M160,32 L240,112 M80,112 L240,112 M80,112 L160,252 M240,112 L160,252 M80,112 L80,212 M240,112 L240,212 M80,212 L240,212 M80,212 L160,252 M240,212 L160,252 M160,252 L80,372 M160,252 L240,372 M80,372 L240,372 M80,372 L160,432 M240,372 L160,432 M160,432 L160,532" stroke="#059669" fill="none" strokeWidth="2" strokeDasharray="4 2" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <header className="pt-24 pb-16 px-6 text-center no-print">
        <h1 className="text-6xl md:text-8xl font-black gradient-text mb-6 uppercase tracking-tighter">
          Árbol de Vida
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-xl font-medium opacity-80 leading-relaxed">
          Explora la cartografía sagrada de tu alma y el legado oculto de tu linaje ancestral.
        </p>
      </header>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* CSV UTILS */}
        <div className="no-print flex flex-wrap justify-center gap-4 mb-12">
           <button onClick={handleCsvExport} className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-white/60 hover:bg-white px-6 py-3 rounded-full border border-emerald-100 flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
             Exportar Datos
           </button>
           <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold uppercase tracking-widest text-cyan-700 bg-white/60 hover:bg-white px-6 py-3 rounded-full border border-cyan-100 flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
             Importar Datos
           </button>
           <input type="file" ref={fileInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card title="Identidad Esencial" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">Nombre Completo</label>
                  <input type="text" value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none" placeholder="Ej: Elena" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">Apellidos</label>
                  <input type="text" value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none" placeholder="Ej: Marín" />
                </div>
                <FlexibleDateInput label="Fecha de Nacimiento" day={user.birthDay} month={user.birthMonth} year={user.birthYear} onChange={handleUserDateChange} />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">Lugar de Origen</label>
                  <input type="text" value={user.birthPlace} onChange={(e) => setUser({...user, birthPlace: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none" placeholder="Ciudad, País" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">Camino Profesional</label>
                  <input type="text" value={user.formation} onChange={(e) => setUser({...user, formation: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none" placeholder="Formación o pasión" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1 tracking-wider">Características Maestras</label>
                  <input type="text" value={user.characteristics} onChange={(e) => setUser({...user, characteristics: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none" placeholder="Pistas sobre tu rol familiar..." />
                </div>
              </div>
              <div className="mt-12 flex justify-center">
                <button onClick={() => setActiveTab('family')} className="btn-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg">Continuar a Relaciones</button>
              </div>
            </Card>
          </div>
        )}

        {/* FAMILY TAB */}
        {activeTab === 'family' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">El Campo Sistémico</h2>
                <p className="text-slate-500 font-medium">Define las ramas de tu árbol y su influencia en tu presente.</p>
              </div>
              <button onClick={handleAddFamilyMember} className="btn-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg">
                <span className="text-xl">+</span> Añadir Relacionado
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {family.map((member) => (
                <div key={member.id} className="glass-card p-8 rounded-[2.5rem] hover:bg-white/90 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1">Vínculo</label>
                      <select value={member.relationshipType} onChange={(e) => updateFamilyMember(member.id, 'relationshipType', e.target.value as RelationshipType)} className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm font-bold text-emerald-800">
                        {Object.values(RelationshipType).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1">Nombre</label>
                      <input type="text" placeholder="Nombre" value={member.firstName} onChange={(e) => updateFamilyMember(member.id, 'firstName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium" />
                    </div>
                    <div className="md:col-span-2">
                       <FlexibleDateInput day={member.birthDay} month={member.birthMonth} year={member.birthYear} onChange={(field, val) => updateFamilyMember(member.id, `birth${field.charAt(0).toUpperCase() + field.slice(1)}` as any, val)} label="Nacimiento" />
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => setFamily(family.filter(f => f.id !== member.id))} className="w-full bg-red-50 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-emerald-50 pt-6">
                     <label className="text-[10px] uppercase font-extrabold text-emerald-700/70 ml-1">Notas / Rasgos Distintivos</label>
                     <input type="text" placeholder="Ej: El protector, buscador incansable..." value={member.characteristics} onChange={(e) => updateFamilyMember(member.id, 'characteristics', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:bg-slate-50" />
                  </div>
                </div>
              ))}
              {family.length === 0 && (
                <div className="text-center py-24 bg-white/40 rounded-[3rem] border-2 border-dashed border-emerald-200">
                   <p className="text-emerald-800/40 font-bold uppercase tracking-widest">No hay relaciones configuradas aún</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CABALA TAB */}
        {activeTab === 'cabala' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="text-center max-w-2xl mx-auto space-y-4">
               <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">Geometría Sagrada</h2>
               <p className="text-slate-500 font-medium leading-relaxed">Las diez emanaciones y su correspondencia cósmica con tu camino personal.</p>
             </div>
             <div className="py-12 bg-white/30 rounded-[4rem] border border-white/50 shadow-inner">
               <TreeVisualization numerologyPath={numerology?.lifePath} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SEFIROT.map(s => (
                  <div key={s.id} className={`p-8 glass-card rounded-[2.5rem] transition-all duration-500 border-l-4 ${numerology?.lifePath === s.id ? 'border-l-emerald-500 ring-4 ring-emerald-500/10 scale-105' : 'border-l-slate-200 opacity-90'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Sefirá {s.id}</span>
                        <h4 className="text-2xl font-black text-slate-800 uppercase">{s.name}</h4>
                      </div>
                      <span className="text-3xl font-bold text-emerald-100">{s.hebrewName}</span>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs py-2 border-b border-slate-100"><span className="font-bold opacity-40 uppercase tracking-widest text-[9px]">Traducción</span> <span className="font-medium">{s.translation}</span></div>
                      <div className="flex justify-between text-xs py-2 border-b border-slate-100"><span className="font-bold opacity-40 uppercase tracking-widest text-[9px]">Planeta</span> <span className="font-medium">{s.planet}</span></div>
                      <div className="flex justify-between text-xs py-2 border-b border-slate-100"><span className="font-bold opacity-40 uppercase tracking-widest text-[9px]">Arcano</span> <span className="font-medium">{s.arcana}</span></div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-2xl">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Dominio Maestro</span>
                      <p className="text-xs font-bold text-emerald-800">{s.dominion}</p>
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-slate-600 font-medium italic opacity-80">{s.description}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* TIKUN & ANALYSIS TAB */}
        {activeTab === 'tikun' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-5xl mx-auto">
            {!analysis ? (
              <div className="text-center py-32 bg-white/40 rounded-[4rem] border border-emerald-100">
                <div className="mb-10 mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-800 uppercase mb-4">Listo para la Revelación</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-12">Procesaremos tu linaje y numerología para entregarte una guía de rectificación profunda.</p>
                <button onClick={generateDeepAnalysis} disabled={loading || !user.firstName} className="btn-primary text-white px-16 py-6 rounded-full font-extrabold text-lg uppercase tracking-[0.2em] shadow-2xl disabled:opacity-30">
                  {loading ? 'Consultando el Akasha...' : 'Generar Análisis Maestro'}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-wrap justify-center gap-4 no-print">
                  <button onClick={handleExportPDF} disabled={exporting} className="bg-emerald-600 text-white px-10 py-5 rounded-full font-extrabold flex items-center gap-3 shadow-2xl transition-all hover:bg-emerald-500 hover:scale-105">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {exporting ? 'Exportando...' : 'Descargar Reporte PDF'}
                  </button>
                  <button onClick={() => setAnalysis('')} className="bg-slate-100 text-slate-600 font-bold px-8 py-5 rounded-full hover:bg-slate-200 transition-all">Nuevo Análisis</button>
                </div>

                <div id="report-container" className="bg-white p-12 md:p-24 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] text-slate-900 border border-slate-100 relative overflow-hidden">
                  {/* Decorative Elements for PDF */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-50 rounded-full blur-[100px] -ml-48 -mb-48 opacity-60"></div>

                  {/* REPORT HEADER */}
                  <div className="text-center relative z-10 border-b-2 border-emerald-50 pb-20 mb-20">
                    <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6">Informe de Sabiduría Ancestral</div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 uppercase tracking-tighter leading-tight">Mapeo del <br/><span className="gradient-text">Árbol de Vida</span></h1>
                    
                    <div className="mt-16 flex flex-col items-center">
                      <div className="text-3xl font-black text-slate-800">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-slate-400 mt-2 font-medium tracking-widest uppercase">Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* FICHA RESUMEN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 relative z-10">
                    <div className="space-y-10">
                      <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-emerald-700">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">01</span>
                        Identidad y Origen
                      </h2>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-slate-50 py-3"><span className="font-bold opacity-30 uppercase tracking-widest text-[9px]">Nacimiento</span> <span className="font-bold text-slate-700">{user.birthDay}/{user.birthMonth}/{user.birthYear || '---'}</span></div>
                        <div className="flex justify-between border-b border-slate-50 py-3"><span className="font-bold opacity-30 uppercase tracking-widest text-[9px]">Ubicación</span> <span className="font-bold text-slate-700">{user.birthPlace || 'N/A'}</span></div>
                        <div className="flex justify-between border-b border-slate-50 py-3"><span className="font-bold opacity-30 uppercase tracking-widest text-[9px]">Misión Álmica</span> <span className="font-bold text-emerald-600">{numerology?.cosmicMission}</span></div>
                      </div>
                    </div>
                    <div className="space-y-10">
                      <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-cyan-700">
                        <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-sm">02</span>
                        Energía Activa
                      </h2>
                      <div className="p-10 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-[3rem] border border-white shadow-sm text-center">
                        <div className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-3">Camino de Vida / Sefirá</div>
                        <div className="text-4xl font-black text-slate-800 mb-1">{SEFIROT.find(s => s.id === numerology?.lifePath)?.name || 'N/A'}</div>
                        <div className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest">{SEFIROT.find(s => s.id === numerology?.lifePath)?.translation}</div>
                      </div>
                    </div>
                  </div>

                  {/* TREE MAP */}
                  <div className="bg-slate-50/50 p-16 rounded-[4rem] mb-20 border border-white shadow-inner relative z-10">
                    <h2 className="text-3xl font-black text-center uppercase tracking-tight mb-12 text-slate-800">Mapeo del Cosmos Personal</h2>
                    <TreeVisualization numerologyPath={numerology?.lifePath} />
                  </div>

                  {/* ANALYSIS CONTENT */}
                  <div className="space-y-20 analysis-content relative z-10">
                     {analysis.split('###').map((section, idx) => {
                       if (idx === 0 && !section.trim()) return null;
                       const lines = section.trim().split('\n');
                       const title = lines[0];
                       const content = lines.slice(1).join('\n');
                       return (
                         <div key={idx} className="group">
                           {title && (
                             <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight border-b-4 border-emerald-100 pb-6 mb-8 group-hover:border-emerald-300 transition-all">
                               {title}
                             </h3>
                           )}
                           <div className="whitespace-pre-wrap pl-10 border-l-4 border-cyan-100 py-4 text-lg leading-relaxed text-slate-700 font-medium italic opacity-90">
                             {content}
                           </div>
                         </div>
                       );
                     })}
                  </div>

                  {/* FOOTER PDF */}
                  <div className="mt-32 pt-16 border-t-2 border-emerald-50 text-center relative z-10">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[1em] mb-4">Integración Sistémica</div>
                    <p className="text-[9px] text-slate-400 max-w-sm mx-auto leading-relaxed">Este reporte es una herramienta de introspección espiritual y autoconocimiento. Los datos son interpretaciones arquetípicas del linaje personal.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-32 py-20 bg-slate-900 text-white text-center no-print">
         <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-black gradient-text uppercase tracking-widest mb-8">Árbol de Vida</h2>
            <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-12">
               <span>Ancestros</span>
               <span>Destino</span>
               <span>Evolución</span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} Cartografía del Ser • Tecnología y Sabiduría Ancestral</p>
         </div>
      </footer>
    </div>
  );
}
