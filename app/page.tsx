'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Anchor, Plus, ChevronRight, ChevronLeft, Check, Pencil, Skull, Sailboat, Coins, Sword, BookOpen, Utensils, Compass, Trophy, Zap, AlertTriangle, ShieldCheck, Crown } from 'lucide-react';

// --- ESTILOS DE ANIMAÇÃO DE FUMO (Injetados no Head) ---
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

    .smoke-cloud {
      position: fixed;
      top: 50%;
      width: 150vh;
      height: 150vh;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0) 70%);
      filter: blur(10px);
      z-index: 100;
      pointer-events: none;
      opacity: 0;
    }

    .smoke-left { left: -50vh; animation: smokeIn 3s ease-out forwards; }
    .smoke-right { right: -50vh; animation: smokeIn 3s ease-out forwards; animation-delay: 0.1s; }

    .rank-reveal-title {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      font-size: 5rem;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      letter-spacing: -0.05em;
      color: white;
      text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,215,0,0.8);
      animation: titleReveal 3s ease-out forwards;
      pointer-events: none;
    }
  `}</style>
);

type Crew = 'Luffy' | 'Zoro' | 'Robin' | 'Sanji';
type Task = { id: string; content: string; bounty: number; crew: Crew };
type ColumnId = 'todo' | 'doing' | 'done';

const GRAND_LINE_ISLANDS = [
  "Vila Foosha", "Shells Town", "Orange Town", "Vila Syrup", "Baratie", "Arlong Park", "Loguetown", 
  "Reverse Mountain", "Whiskey Peak", "Little Garden", "Drum Island", "Alabasta", "Jaya", "Skypiea", 
  "Long Ring Long Land", "Water 7", "Enies Lobby", "Post-Enies Lobby", "Thriller Bark", "Sabaody", 
  "Amazon Lily", "Impel Down", "Marineford", "Rusukaina", 
  "Ilha dos Tritões", "Punk Hazard", "Dressrosa", "Zou", "Whole Cake Island", "Wano Kuni", "Egghead"
];

const CREW_DATA: Record<Crew, { icon: React.ReactNode; color: string; tip: Record<ColumnId, string> }> = {
  Luffy: { icon: <Anchor size={14} />, color: 'bg-red-500', tip: { todo: "Planeamento!", doing: "Uhul! Vamos zarpar!", done: "Carneee!" } },
  Zoro: { icon: <Sword size={14} />, color: 'bg-green-600', tip: { todo: "Foca no treino.", doing: "Corta distrações.", done: "Próximo." } },
  Robin: { icon: <BookOpen size={14} />, color: 'bg-purple-600', tip: { todo: "Lê as entrelinhas.", doing: "Múltiplas mãos... foco.", done: "Conhecimento acumulado." } },
  Sanji: { icon: <Utensils size={14} />, color: 'bg-yellow-500', tip: { todo: "Ingredientes prontos!", doing: "Não deixes queimar!", done: "Sabor da vitória!" } },
};

const RANKS = [
  { min: 0, title: "Recruta", color: "text-slate-400", glow: "text-shadow: 0 0 10px rgba(255,255,255,0.2);" },
  { min: 1000000, title: "Pirata Novato", color: "text-blue-400", glow: "text-shadow: 0 0 10px rgba(59,130,246,0.6);" },
  { min: 10000000, title: "Supernova", color: "text-orange-400", glow: "text-shadow: 0 0 10px rgba(251,146,60,0.6);" },
  { min: 30000000, title: "Shichibukai", color: "text-emerald-400", glow: "text-shadow: 0 0 10px rgba(16,185,129,0.6);" },
  { min: 50000000, title: "Imperador (Yonko)", color: "text-red-500", glow: "text-shadow: 0 0 15px rgba(239,68,68,0.8);" },
  { min: 100000000, title: "Rei dos Piratas", color: "text-yellow-400 animate-pulse", glow: "text-shadow: 0 0 20px rgba(250,204,21,1);" },
];

export default function Gear5UltimateKanban() {
  const [tasks, setTasks] = useState<Record<ColumnId, Task[]>>({ todo: [], doing: [], done: [] });
  const [text, setText] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Crew>('Luffy');
  const [persistentBounty, setPersistentBounty] = useState(0);
  const [progress, setProgress] = useState(0);
  const [islandIndex, setIslandIndex] = useState(0);
  const [isAwakened, setIsAwakened] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingRank, setIsAnimatingRank] = useState(false); // ESTADO PARA O FUMO E REVELAÇÃO

  const GEAR5_IMG = 'https://wallpaperaccess.com/full/11020389.jpg';

  // Inicialização
  useEffect(() => {
    const savedTasks = localStorage.getItem('@kanban-tasks-v5');
    const savedIsland = localStorage.getItem('@kanban-island-v5');
    const savedBounty = localStorage.getItem('@kanban-bounty-v5');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedIsland) setIslandIndex(parseInt(savedIsland));
    if (savedBounty) setPersistentBounty(parseInt(savedBounty));
    setIsMounted(true);
  }, []);

  // Lógica de Rank e Celebração Silenciosa com Fumo
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('@kanban-tasks-v5', JSON.stringify(tasks));
      localStorage.setItem('@kanban-island-v5', islandIndex.toString());
      localStorage.setItem('@kanban-bounty-v5', persistentBounty.toString());
      
      const total = tasks.todo.length + tasks.doing.length + tasks.done.length;
      setProgress(total === 0 ? 0 : Math.round((tasks.done.length / total) * 100));

      // Lógica de Meta Yonko Silenciosa (Mantida, mas sem som)
      if (persistentBounty >= 50000000 && !localStorage.getItem('@reached-yonko-v5')) {
        localStorage.setItem('@reached-yonko-v5', 'true');
      }
    }
  }, [tasks, islandIndex, persistentBounty, isMounted]);

  const triggerSmokeReveal = () => {
    setIsAnimatingRank(true);
    setTimeout(() => setIsAnimatingRank(false), 3000); // Duração da animação
  };

  const getRank = () => {
    return [...RANKS].reverse().find(r => persistentBounty >= r.min) || RANKS[0];
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newTask: Task = { id: Date.now().toString(), content: text, bounty: Math.floor(Math.random() * 5000000) + 2000000, crew: selectedCrew };
    setTasks(prev => ({ ...prev, todo: [newTask, ...prev.todo] }));
    setText('');
  };

  const moveTask = (currentCol: ColumnId, targetCol: ColumnId, taskId: string) => {
    const task = tasks[currentCol].find(t => t.id === taskId);
    if (!task) return;
    
    if (targetCol === 'done' && currentCol !== 'done') {
        const newBounty = persistentBounty + task.bounty;
        const oldRank = getRank().title;
        const newRank = [...RANKS].reverse().find(r => newBounty >= r.min)?.title;
        
        // Se subir de Rank, dispara o fumo e revelação central
        if (oldRank !== newRank) triggerSmokeReveal();
        setPersistentBounty(newBounty);
    }
    
    if (currentCol === 'done' && targetCol !== 'done') setPersistentBounty(prev => Math.max(0, prev - task.bounty));
    
    setTasks(prev => ({ 
        ...prev, 
        [currentCol]: prev[currentCol].filter(t => t.id !== taskId), 
        [targetCol]: [...prev[targetCol], task] 
    }));
  };

  if (!isMounted) return null;
  const currentRank = getRank();

  return (
    <div className={`min-h-screen p-4 md:p-10 relative overflow-x-hidden transition-all duration-700 ${isAwakened ? 'text-black' : 'text-white'}`}>
      <SmokeStyles />
      <div className={`fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ${isAwakened ? 'grayscale invert brightness-150' : ''}`} style={{ backgroundImage: `url(${GEAR5_IMG})` }} />
      <div className={`fixed inset-0 z-10 ${isAwakened ? 'bg-white/90' : 'bg-black/70'} backdrop-blur-[2px]`} />

      {/* --- EFEITO VISUAL DE FUMO E REVELAÇÃO DO RANK --- */}
      {isAnimatingRank && (
        <>
          <div className="smoke-cloud smoke-left" />
          <div className="smoke-cloud smoke-right" />
          <div className="rank-reveal-title">
            <ShieldCheck size={50} className="inline-block mr-4 text-yellow-500" />
            {currentRank.title}
          </div>
        </>
      )}
      {/* -------------------------------------------------- */}

      <div className="relative z-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* CARD DE STATUS */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center gap-6 shadow-2xl transition-all ${isAwakened ? 'bg-white border-black/10' : 'bg-black/60 border-yellow-600/30'} ${persistentBounty >= 50000000 ? 'ring-4 ring-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]' : ''}`}>
            <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/40">
              {persistentBounty >= 50000000 ? <Crown size={40} className="text-red-500" /> : <Trophy size={40} className="text-yellow-500" />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Status</p>
              <p className="text-3xl font-black italic">฿ {persistentBounty.toLocaleString()}</p>
              <div className={`flex items-center gap-2 mt-1 font-black uppercase text-xs ${currentRank.color}`}>
                <ShieldCheck size={14} /> {currentRank.title}
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center justify-between shadow-2xl ${isAwakened ? 'bg-white border-black/10' : 'bg-black/60 border-blue-600/30'}`}>
            <div className="flex items-center gap-6">
              <Compass size={40} className="text-blue-400" />
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Ilha</p>
                <h2 className="text-2xl font-black italic uppercase">{GRAND_LINE_ISLANDS[islandIndex]}</h2>
              </div>
            </div>
            {progress === 100 && tasks.done.length > 0 && (
                <button onClick={() => { setIslandIndex(i => i + 1); setTasks({todo:[], doing:[], done:[]}); }} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs hover:scale-110 shadow-lg">ZARPAR</button>
            )}
          </div>
        </div>

        <header className="mb-16">
          <form onSubmit={addTask} className={`flex flex-col md:flex-row gap-4 p-4 rounded-[2.5rem] border backdrop-blur-2xl transition-all ${isAwakened ? 'bg-white border-black/10 shadow-xl' : 'bg-white/5 border-white/10'}`}>
            <div className="flex gap-2 p-1 bg-black/30 rounded-2xl overflow-x-auto no-scrollbar">
              {(Object.keys(CREW_DATA) as Crew[]).map(member => (
                <button key={member} type="button" onClick={() => setSelectedCrew(member)} className={`px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ${selectedCrew === member ? `${CREW_DATA[member].color} text-white` : 'text-slate-400 hover:bg-white/5'}`}>
                  {CREW_DATA[member].icon} {member}
                </button>
              ))}
            </div>
            <input className="bg-transparent flex-1 px-4 py-2 outline-none font-bold" placeholder="O que vamos fazer?" value={text} onChange={(e) => setText(e.target.value)} />
            <button className={`px-10 py-4 rounded-2xl font-black text-xs ${isAwakened ? 'bg-black text-white' : 'bg-white text-black'}`}>RECRUTAR</button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['todo', 'doing', 'done'] as ColumnId[]).map((id) => {
            const theme = id === 'todo' ? { title: 'A Fazer', color: 'border-red-600', icon: <Skull size={18}/> } : id === 'doing' ? { title: 'Em Progresso', color: 'border-orange-500', icon: <Sailboat size={18}/> } : { title: 'Concluído', color: 'border-purple-600', icon: <Coins size={18}/> };
            return (
              <div key={id} className={`rounded-[2.5rem] border backdrop-blur-3xl min-h-[600px] flex flex-col ${isAwakened ? 'bg-white border-black/5' : 'bg-black/30 border-white/5'}`}>
                <div className="p-7 border-b border-white/5">
                  <h2 className="font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
                    <span className="opacity-50">{theme.icon}</span> {theme.title}
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {tasks[id].map((task) => (
                    <div key={task.id} className={`p-6 rounded-[2.5rem] border-l-[8px] ${theme.color} border-y border-r transition-all group ${isAwakened ? 'bg-white border-black/10 text-black shadow-md' : 'bg-slate-950/80 border-white/5 text-white shadow-2xl'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${CREW_DATA[task.crew].color} text-white`}>{task.crew}</span>
                        <span className="text-yellow-500 font-black text-[11px]">฿ {task.bounty.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed mb-6">{task.content}</p>
                      <div className="flex gap-2 pt-4 border-t border-white/5">
                        {id !== 'todo' && <button onClick={() => moveTask(id, id === 'done' ? 'doing' : 'todo', task.id)} className="p-3 bg-black/20 rounded-2xl"><ChevronLeft size={16}/></button>}
                        {id !== 'done' ? (
                          <button onClick={() => moveTask(id, id === 'todo' ? 'doing' : 'done', task.id)} className={`flex-1 font-black text-[10px] rounded-2xl transition-all ${isAwakened ? 'bg-black text-white' : 'bg-white text-black'}`}>AVANÇAR</button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-emerald-500 font-black text-[9px] uppercase"><Check size={14} className="mr-1"/> Concluído</div>
                        )}
                        <button onClick={() => setTasks(prev => ({ ...prev, [id]: prev[id].filter(t => t.id !== task.id) }))} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => setIsAwakened(!isAwakened)} className={`fixed bottom-8 right-8 z-50 p-6 rounded-full transition-all duration-500 shadow-2xl hover:scale-110 ${isAwakened ? 'bg-black text-white' : 'bg-yellow-500 text-black'}`}>
        <Zap size={32} />
      </button>
    </div>
  );
}