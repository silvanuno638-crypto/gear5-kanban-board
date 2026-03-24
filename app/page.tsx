'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Anchor, ChevronRight, ChevronLeft, Check, Skull, Sailboat, Coins, Sword, BookOpen, Utensils, Compass, Trophy, Zap, ShieldCheck, Crown, History } from 'lucide-react';

// --- ESTILOS DE ANIMAÇÃO DE FUMO ---
const SmokeStyles = () => (
  <style jsx global>{`
    @keyframes smokeIn {
      0% { transform: scale(0.2) translate(-50%, -50%); opacity: 0; filter: blur(20px); }
      15% { transform: scale(1) translate(-50%, -50%); opacity: 1; filter: blur(5px); }
      80% { transform: scale(1.1) translate(-50%, -50%); opacity: 1; filter: blur(2px); }
      100% { transform: scale(1.3) translate(-50%, -50%); opacity: 0; filter: blur(15px); }
    }
    @keyframes titleReveal {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
      20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    }
    .smoke-cloud { position: fixed; top: 50%; width: 150vh; height: 150vh; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0) 70%); filter: blur(10px); z-index: 100; pointer-events: none; opacity: 0; }
    .smoke-left { left: -50vh; animation: smokeIn 2.5s ease-out forwards; }
    .smoke-right { right: -50vh; animation: smokeIn 2.5s ease-out forwards; animation-delay: 0.1s; }
    .rank-reveal-title { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 101; font-size: 4rem; font-weight: 900; font-style: italic; text-transform: uppercase; color: white; text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,215,0,0.8); animation: titleReveal 2.5s ease-out forwards; pointer-events: none; text-align: center; }
  `}</style>
);

type Crew = 'Luffy' | 'Zoro' | 'Robin' | 'Sanji';
type Task = { id: string; content: string; bounty: number; crew: Crew };
type ColumnId = 'todo' | 'doing' | 'done';
type IslandTasks = Record<ColumnId, Task[]>;

const GRAND_LINE_ISLANDS = [
  "Vila Foosha", "Shells Town", "Orange Town", "Vila Syrup", "Baratie", "Arlong Park", "Loguetown", 
  "Reverse Mountain", "Whiskey Peak", "Little Garden", "Drum Island", "Alabasta", "Jaya", "Skypiea", 
  "Long Ring Long Land", "Water 7", "Enies Lobby", "Post-Enies Lobby", "Thriller Bark", "Sabaody", 
  "Amazon Lily", "Impel Down", "Marineford", "Rusukaina", 
  "Ilha dos Tritões", "Punk Hazard", "Dressrosa", "Zou", "Whole Cake Island", "Wano Kuni", "Egghead"
];

const CREW_DATA: Record<Crew, { icon: React.ReactNode; color: string }> = {
  Luffy: { icon: <Anchor size={14} />, color: 'bg-red-500' },
  Zoro: { icon: <Sword size={14} />, color: 'bg-green-600' },
  Robin: { icon: <BookOpen size={14} />, color: 'bg-purple-600' },
  Sanji: { icon: <Utensils size={14} />, color: 'bg-yellow-500' },
};

const RANKS = [
  { min: 0, title: "Recruta", color: "text-slate-400" },
  { min: 1000000, title: "Pirata Novato", color: "text-blue-400" },
  { min: 10000000, title: "Supernova", color: "text-orange-400" },
  { min: 30000000, title: "Shichibukai", color: "text-emerald-400" },
  { min: 50000000, title: "Imperador (Yonko)", color: "text-red-500" },
  { min: 100000000, title: "Rei dos Piratas", color: "text-yellow-400 animate-pulse" },
];

export default function Gear5HistoryKanban() {
  const [worldData, setWorldData] = useState<Record<string, IslandTasks>>({});
  const [islandIndex, setIslandIndex] = useState(0);
  const [text, setText] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Crew>('Luffy');
  const [persistentBounty, setPersistentBounty] = useState(0);
  const [isAwakened, setIsAwakened] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingRank, setIsAnimatingRank] = useState(false);

  const currentIslandName = GRAND_LINE_ISLANDS[islandIndex];
  const GEAR5_IMG = 'https://wallpaperaccess.com/full/11020389.jpg';

  // Carregar dados
  useEffect(() => {
    const savedWorld = localStorage.getItem('@onepiece-world-v1');
    const savedIndex = localStorage.getItem('@onepiece-index-v1');
    const savedBounty = localStorage.getItem('@onepiece-bounty-v1');
    
    if (savedWorld) setWorldData(JSON.parse(savedWorld));
    if (savedIndex) setIslandIndex(parseInt(savedIndex));
    if (savedBounty) setPersistentBounty(parseInt(savedBounty));
    setIsMounted(true);
  }, []);

  // Guardar dados sempre que algo muda
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('@onepiece-world-v1', JSON.stringify(worldData));
      localStorage.setItem('@onepiece-index-v1', islandIndex.toString());
      localStorage.setItem('@onepiece-bounty-v1', persistentBounty.toString());
    }
  }, [worldData, islandIndex, persistentBounty, isMounted]);

  // Obter tarefas da ilha atual ou inicializar se vazia
  const getCurrentTasks = (): IslandTasks => {
    return worldData[currentIslandName] || { todo: [], doing: [], done: [] };
  };

  const updateCurrentIslandTasks = (newTasks: IslandTasks) => {
    setWorldData(prev => ({
      ...prev,
      [currentIslandName]: newTasks
    }));
  };

  const getRank = (bounty: number) => {
    return [...RANKS].reverse().find(r => bounty >= r.min) || RANKS[0];
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const currentTasks = getCurrentTasks();
    const newTask: Task = { id: Date.now().toString(), content: text, bounty: Math.floor(Math.random() * 5000000) + 2000000, crew: selectedCrew };
    
    updateCurrentIslandTasks({
      ...currentTasks,
      todo: [newTask, ...currentTasks.todo]
    });
    setText('');
  };

  const moveTask = (currentCol: ColumnId, targetCol: ColumnId, taskId: string) => {
    const currentTasks = getCurrentTasks();
    const task = currentTasks[currentCol].find(t => t.id === taskId);
    if (!task) return;

    if (targetCol === 'done' && currentCol !== 'done') {
      const oldRank = getRank(persistentBounty).title;
      const newBounty = persistentBounty + task.bounty;
      if (oldRank !== getRank(newBounty).title) {
        setIsAnimatingRank(true);
        setTimeout(() => setIsAnimatingRank(false), 2500);
      }
      setPersistentBounty(newBounty);
    }
    if (currentCol === 'done' && targetCol !== 'done') setPersistentBounty(prev => Math.max(0, prev - task.bounty));

    const updatedTasks = {
      ...currentTasks,
      [currentCol]: currentTasks[currentCol].filter(t => t.id !== taskId),
      [targetCol]: [...currentTasks[targetCol], task]
    };
    updateCurrentIslandTasks(updatedTasks);
  };

  if (!isMounted) return null;
  const tasks = getCurrentTasks();
  const progress = (tasks.todo.length + tasks.doing.length + tasks.done.length) === 0 ? 0 : Math.round((tasks.done.length / (tasks.todo.length + tasks.doing.length + tasks.done.length)) * 100);

  return (
    <div className={`min-h-screen p-4 md:p-10 relative transition-all duration-700 ${isAwakened ? 'text-black' : 'text-white'}`}>
      <SmokeStyles />
      <div className={`fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ${isAwakened ? 'grayscale invert brightness-150' : ''}`} style={{ backgroundImage: `url(${GEAR5_IMG})` }} />
      <div className={`fixed inset-0 z-10 ${isAwakened ? 'bg-white/90' : 'bg-black/80'} backdrop-blur-[2px]`} />

      {isAnimatingRank && (
        <>
          <div className="smoke-cloud smoke-left" />
          <div className="smoke-cloud smoke-right" />
          <div className="rank-reveal-title">RANK UP!<br/><span className="text-2xl opacity-80">{getRank(persistentBounty).title}</span></div>
        </>
      )}

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* HEADER STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center gap-6 shadow-2xl ${isAwakened ? 'bg-white border-black/10' : 'bg-black/60 border-yellow-600/30'}`}>
            <Trophy size={40} className="text-yellow-500" />
            <div>
              <p className="text-[10px] uppercase font-black opacity-60">Recompensa Global</p>
              <p className="text-3xl font-black italic">฿ {persistentBounty.toLocaleString()}</p>
              <p className={`text-xs font-bold uppercase ${getRank(persistentBounty).color}`}>{getRank(persistentBounty).title}</p>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center justify-between shadow-2xl ${isAwakened ? 'bg-white border-black/10' : 'bg-black/60 border-blue-600/30'}`}>
            <div className="flex items-center gap-4">
              <button onClick={() => setIslandIndex(prev => Math.max(0, prev - 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft/></button>
              <div>
                <p className="text-[10px] uppercase font-black opacity-60">Diário de Bordo</p>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{currentIslandName}</h2>
              </div>
              <button onClick={() => setIslandIndex(prev => Math.min(GRAND_LINE_ISLANDS.length - 1, prev + 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight/></button>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black opacity-60 uppercase">Exploração</p>
              <p className="text-xl font-black">{progress}%</p>
            </div>
          </div>
        </div>

        {/* INPUT */}
        <header className="mb-12">
          <form onSubmit={addTask} className={`flex flex-col md:flex-row gap-4 p-4 rounded-[2.5rem] border backdrop-blur-2xl ${isAwakened ? 'bg-white border-black/10 shadow-xl' : 'bg-white/5 border-white/10'}`}>
            <div className="flex gap-2 p-1 bg-black/30 rounded-2xl">
              {(Object.keys(CREW_DATA) as Crew[]).map(member => (
                <button key={member} type="button" onClick={() => setSelectedCrew(member)} className={`px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase ${selectedCrew === member ? `${CREW_DATA[member].color} text-white` : 'text-slate-400'}`}>
                  {member}
                </button>
              ))}
            </div>
            <input className="bg-transparent flex-1 px-4 py-2 outline-none font-bold" placeholder={`Nova missão em ${currentIslandName}...`} value={text} onChange={(e) => setText(e.target.value)} />
            <button className={`px-10 py-4 rounded-2xl font-black text-xs ${isAwakened ? 'bg-black text-white' : 'bg-white text-black'}`}>ADICIONAR</button>
          </form>
        </header>

        {/* COLUNAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['todo', 'doing', 'done'] as ColumnId[]).map((id) => {
            const theme = id === 'todo' ? { title: 'A Fazer', color: 'border-red-600', icon: <Skull size={18}/> } : id === 'doing' ? { title: 'Em Progresso', color: 'border-orange-500', icon: <Sailboat size={18}/> } : { title: 'Concluído', color: 'border-purple-600', icon: <Coins size={18}/> };
            return (
              <div key={id} className={`rounded-[2.5rem] border backdrop-blur-3xl min-h-[500px] flex flex-col ${isAwakened ? 'bg-white border-black/5' : 'bg-black/30 border-white/5'}`}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="font-black uppercase text-[11px] tracking-widest flex items-center gap-3">
                    {theme.icon} {theme.title}
                  </h2>
                  <span className="text-[10px] font-bold opacity-40">{tasks[id].length}</span>
                </div>
                <div className="p-6 space-y-4">
                  {tasks[id].map((task) => (
                    <div key={task.id} className={`p-5 rounded-[2rem] border-l-[6px] ${theme.color} border-y border-r transition-all ${isAwakened ? 'bg-white border-black/10 text-black shadow-md' : 'bg-slate-950/80 border-white/5 text-white shadow-xl'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${CREW_DATA[task.crew].color} text-white`}>{task.crew}</span>
                        <span className="text-yellow-500 font-black text-[10px]">฿ {task.bounty.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-bold leading-tight mb-4">{task.content}</p>
                      <div className="flex gap-2 pt-3 border-t border-white/5">
                        {id !== 'todo' && <button onClick={() => moveTask(id, id === 'done' ? 'doing' : 'todo', task.id)} className="p-2 bg-black/20 rounded-xl hover:bg-black/40"><ChevronLeft size={14}/></button>}
                        {id !== 'done' ? (
                          <button onClick={() => moveTask(id, id === 'todo' ? 'doing' : 'done', task.id)} className={`flex-1 font-black text-[9px] rounded-xl transition-all ${isAwakened ? 'bg-black text-white' : 'bg-white text-black'}`}>MOVER</button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-emerald-500 font-black text-[9px] uppercase"><Check size={12} className="mr-1"/> OK</div>
                        )}
                        <button onClick={() => {
                          const updated = { ...tasks, [id]: tasks[id].filter(t => t.id !== task.id) };
                          updateCurrentIslandTasks(updated);
                        }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {tasks[id].length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                      <History size={24} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => setIsAwakened(!isAwakened)} className={`fixed bottom-8 right-8 z-50 p-6 rounded-full shadow-2xl transition-all ${isAwakened ? 'bg-black text-white' : 'bg-yellow-500 text-black'}`}>
        <Zap size={32} />
      </button>
    </div>
  );
}