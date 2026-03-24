'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Anchor, ChevronRight, ChevronLeft, Check, Skull, Sailboat, Coins, Sword, BookOpen, Utensils, Compass, Trophy, Zap, ShieldCheck, Crown, Map as MapIcon, X, Star } from 'lucide-react';

// --- ESTILOS DE ANIMAÇÃO ---
const ExtraStyles = () => (
  <style jsx global>{`
    @keyframes shine { 0% { opacity: 0.5; } 50% { opacity: 1; scale: 1.1; } 100% { opacity: 0.5; } }
    .island-completed { filter: drop-shadow(0 0 8px #fbbf24); animation: shine 2s infinite; }
    @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .map-modal { animation: slideUp 0.4s ease-out forwards; }
  `}</style>
);

type Crew = 'Luffy' | 'Zoro' | 'Robin' | 'Sanji';
type Task = { id: string; content: string; bounty: number; crew: Crew; completedAt?: number };
type ColumnId = 'todo' | 'doing' | 'done';
type IslandTasks = Record<ColumnId, Task[]>;

const GRAND_LINE_ISLANDS = [
  "Vila Foosha", "Shells Town", "Orange Town", "Vila Syrup", "Baratie", "Arlong Park", "Loguetown", 
  "Reverse Mountain", "Whiskey Peak", "Little Garden", "Drum Island", "Alabasta", "Jaya", "Skypiea", 
  "Long Ring Long Land", "Water 7", "Enies Lobby", "Post-Enies Lobby", "Thriller Bark", "Sabaody", 
  "Amazon Lily", "Impel Down", "Marineford", "Rusukaina", 
  "Ilha dos Tritões", "Punk Hazard", "Dressrosa", "Zou", "Whole Cake Island", "Wano Kuni", "Egghead"
];

const CREW_DATA: Record<Crew, { icon: React.ReactNode; color: string; buff: string }> = {
  Luffy: { icon: <Anchor size={14} />, color: 'bg-red-500', buff: "+20% Bounty (Capitão)" },
  Zoro: { icon: <Sword size={14} />, color: 'bg-green-600', buff: "Bónus de Foco" },
  Robin: { icon: <BookOpen size={14} />, color: 'bg-purple-600', buff: "Bounty Inteligente" },
  Sanji: { icon: <Utensils size={14} />, color: 'bg-yellow-500', buff: "Bónus Hora de Comer" },
};

export default function OnePieceUltimateVoyage() {
  const [worldData, setWorldData] = useState<Record<string, IslandTasks>>({});
  const [islandIndex, setIslandIndex] = useState(0);
  const [text, setText] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Crew>('Luffy');
  const [persistentBounty, setPersistentBounty] = useState(0);
  const [isAwakened, setIsAwakened] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const currentIslandName = GRAND_LINE_ISLANDS[islandIndex];

  useEffect(() => {
    const savedWorld = localStorage.getItem('@op-world-v2');
    const savedIndex = localStorage.getItem('@op-index-v2');
    const savedBounty = localStorage.getItem('@op-bounty-v2');
    if (savedWorld) setWorldData(JSON.parse(savedWorld));
    if (savedIndex) setIslandIndex(parseInt(savedIndex));
    if (savedBounty) setPersistentBounty(parseInt(savedBounty));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('@op-world-v2', JSON.stringify(worldData));
      localStorage.setItem('@op-index-v2', islandIndex.toString());
      localStorage.setItem('@op-bounty-v2', persistentBounty.toString());
    }
  }, [worldData, islandIndex, persistentBounty, isMounted]);

  const getCurrentTasks = (): IslandTasks => worldData[currentIslandName] || { todo: [], doing: [], done: [] };

  const updateCurrentIslandTasks = (newTasks: IslandTasks) => {
    setWorldData(prev => ({ ...prev, [currentIslandName]: newTasks }));
  };

  const calculateBuffedBounty = (task: Task) => {
    let finalBounty = task.bounty;
    const now = new Date();
    const hour = now.getHours();

    if (task.crew === 'Luffy') finalBounty *= 1.2;
    if (task.crew === 'Sanji' && ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21))) finalBounty *= 2;
    if (task.crew === 'Robin') finalBounty += 1000000;
    
    return Math.floor(finalBounty);
  };

  const moveTask = (currentCol: ColumnId, targetCol: ColumnId, taskId: string) => {
    const currentTasks = getCurrentTasks();
    const task = currentTasks[currentCol].find(t => t.id === taskId);
    if (!task) return;

    if (targetCol === 'done' && currentCol !== 'done') {
      const buffedValue = calculateBuffedBounty(task);
      setPersistentBounty(prev => prev + buffedValue);
    }

    const updatedTasks = {
      ...currentTasks,
      [currentCol]: currentTasks[currentCol].filter(t => t.id !== taskId),
      [targetCol]: [...currentTasks[targetCol], { ...task, completedAt: targetCol === 'done' ? Date.now() : undefined }]
    };
    updateCurrentIslandTasks(updatedTasks);
  };

  const isIslandComplete = (name: string) => {
    const data = worldData[name];
    if (!data) return false;
    return data.done.length > 0 && data.todo.length === 0 && data.doing.length === 0;
  };

  if (!isMounted) return null;
  const tasks = getCurrentTasks();
  const totalInIsland = tasks.todo.length + tasks.doing.length + tasks.done.length;
  const progress = totalInIsland === 0 ? 0 : Math.round((tasks.done.length / totalInIsland) * 100);

  return (
    <div className={`min-h-screen p-4 md:p-10 relative transition-all duration-700 ${isAwakened ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <ExtraStyles />
      <div className={`fixed inset-0 z-0 bg-cover bg-center opacity-30 ${isAwakened ? 'grayscale invert' : ''}`} style={{ backgroundImage: `url('https://wallpaperaccess.com/full/11020389.jpg')` }} />
      
      <div className="relative z-20 max-w-7xl mx-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-yellow-600/30 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-4">
              <Trophy className="text-yellow-500" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase opacity-50">Bounty do Capitão</p>
                <p className="text-3xl font-black italic">฿ {persistentBounty.toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => setShowMap(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95">
              <MapIcon size={16} /> MAPA MUNDI
            </button>
          </div>
        </div>

        {/* ISLAND NAV */}
        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-[2.5rem] border border-white/5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIslandIndex(prev => Math.max(0, prev - 1))} className="p-3 hover:bg-white/10 rounded-2xl"><ChevronLeft/></button>
            <div className="text-center min-w-[150px]">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">{currentIslandName}</h2>
              <div className="flex justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < (progress/20) ? "text-yellow-500 fill-yellow-500" : "text-white/10"} />)}
              </div>
            </div>
            <button onClick={() => setIslandIndex(prev => Math.min(GRAND_LINE_ISLANDS.length - 1, prev + 1))} className="p-3 hover:bg-white/10 rounded-2xl"><ChevronRight/></button>
          </div>
          <div className="hidden md:block flex-1 mx-10 h-2 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-red-500 to-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* CHARACTER SELECT & INPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            <div className="lg:col-span-1 bg-white/5 p-4 rounded-[2rem] border border-white/10">
                <p className="text-[10px] font-black uppercase mb-3 opacity-50 text-center">Ativar Habilidade</p>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CREW_DATA) as Crew[]).map(c => (
                        <button key={c} onClick={() => setSelectedCrew(c)} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${selectedCrew === c ? CREW_DATA[c].color : 'bg-black/40 opacity-40 hover:opacity-100'}`}>
                            {CREW_DATA[c].icon}
                            <span className="text-[9px] font-black uppercase">{c}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-[9px] text-center font-bold text-yellow-500">{CREW_DATA[selectedCrew].buff}</p>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                const newTask: Task = { id: Date.now().toString(), content: text, bounty: 2500000, crew: selectedCrew };
                updateCurrentIslandTasks({ ...tasks, todo: [newTask, ...tasks.todo] });
                setText('');
            }} className="lg:col-span-3 bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center gap-4">
                <input className="bg-transparent flex-1 px-4 text-lg font-bold outline-none" placeholder={`O que o ${selectedCrew} vai fazer em ${currentIslandName}?`} value={text} onChange={e => setText(e.target.value)} />
                <button className="bg-white text-black h-full px-10 rounded-2xl font-black text-xs hover:scale-105 transition-all">RECRUTAR</button>
            </form>
        </div>

        {/* KANBAN COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['todo', 'doing', 'done'] as ColumnId[]).map((id) => {
             const config = id === 'todo' ? { t: 'A FAZER', c: 'border-red-500', i: <Skull/> } : id === 'doing' ? { t: 'EM NAVEGAÇÃO', c: 'border-orange-500', i: <Sailboat/> } : { t: 'SAQUEADO', c: 'border-emerald-500', i: <Coins/> };
             return (
               <div key={id} className="flex flex-col gap-6">
                 <div className="flex items-center gap-3 px-4">
                    <span className="opacity-40">{config.i}</span>
                    <h3 className="font-black text-xs tracking-[0.2em]">{config.t}</h3>
                    <span className="ml-auto bg-white/5 px-2 py-1 rounded text-[10px] font-bold">{tasks[id].length}</span>
                 </div>
                 <div className="space-y-4 min-h-[400px]">
                    {tasks[id].map(t => (
                        <div key={t.id} className={`p-6 rounded-[2.2rem] border-l-[6px] ${config.c} bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl group hover:translate-y-[-4px] transition-all`}>
                            <div className="flex justify-between items-center mb-4">
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black text-white ${CREW_DATA[t.crew].color}`}>{t.crew}</div>
                                <div className="text-yellow-500 font-black text-[10px]">฿ {t.bounty.toLocaleString()}</div>
                            </div>
                            <p className="font-bold text-sm leading-relaxed mb-6">{t.content}</p>
                            <div className="flex gap-2">
                                {id !== 'done' ? (
                                    <button onClick={() => moveTask(id, id === 'todo' ? 'doing' : 'done', t.id)} className="flex-1 bg-white text-black py-3 rounded-xl font-black text-[9px] uppercase hover:bg-yellow-500 transition-colors">AVANÇAR</button>
                                ) : (
                                    <div className="flex-1 text-center py-3 text-emerald-500 font-black text-[9px] uppercase flex items-center justify-center gap-1"><Check size={12}/> CONCLUÍDO</div>
                                )}
                                <button onClick={() => updateCurrentIslandTasks({...tasks, [id]: tasks[id].filter(x => x.id !== t.id)})} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* --- MODAL MAPA MUNDI --- */}
      {showMap && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 md:p-12 overflow-y-auto map-modal">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-black italic flex items-center gap-4 underline decoration-blue-500">
                        <MapIcon size={40} className="text-blue-500" /> MAPA DA GRAND LINE
                    </h2>
                    <button onClick={() => setShowMap(false)} className="p-4 bg-white/10 hover:bg-red-500 rounded-full transition-all">
                        <X size={32} />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {GRAND_LINE_ISLANDS.map((name, i) => {
                        const complete = isIslandComplete(name);
                        const isCurrent = currentIslandName === name;
                        return (
                            <button key={name} onClick={() => { setIslandIndex(i); setShowMap(false); }} className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${complete ? 'border-yellow-500 bg-yellow-500/10' : isCurrent ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'}`}>
                                <div className="absolute top-2 right-2">
                                    {complete ? <Crown size={16} className="text-yellow-500 island-completed" /> : <span className="text-[10px] font-black opacity-20">#{i+1}</span>}
                                </div>
                                <div className={`p-4 rounded-2xl ${complete ? 'bg-yellow-500 text-black' : isCurrent ? 'bg-blue-500' : 'bg-white/5'}`}>
                                    {complete ? <Star /> : <Compass />}
                                </div>
                                <span className="text-[10px] font-black text-center uppercase leading-tight">{name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      <button onClick={() => setIsAwakened(!isAwakened)} className={`fixed bottom-8 right-8 z-50 p-6 rounded-full shadow-2xl transition-all active:scale-90 ${isAwakened ? 'bg-black text-white' : 'bg-yellow-500 text-black'}`}>
        <Zap size={32} className={isAwakened ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
}