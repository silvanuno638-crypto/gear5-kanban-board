'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Anchor, Plus, ChevronRight, ChevronLeft, Check, Pencil, Skull, Sailboat, Coins, Sword, BookOpen, Utensils, Compass, Map, Trophy } from 'lucide-react';

type Crew = 'Luffy' | 'Zoro' | 'Robin' | 'Sanji';
type Task = { id: string; content: string; bounty: number; crew: Crew };
type ColumnId = 'todo' | 'doing' | 'done';

// ROTA COMPLETA POR ONDE LUFFY PASSOU (East Blue -> Grand Line -> Novo Mundo)
const GRAND_LINE_ISLANDS = [
  "Vila Foosha", "Shells Town", "Orange Town", "Vila Syrup", "Baratie", "Arlong Park", "Loguetown", // East Blue
  "Reverse Mountain", "Whiskey Peak", "Little Garden", "Drum Island", "Alabasta", "Jaya", "Skypiea", // Grand Line Inicial
  "Long Ring Long Land", "Water 7", "Enies Lobby", "Post-Enies Lobby", "Thriller Bark", "Sabaody", // CP9/Moria
  "Amazon Lily", "Impel Down", "Marineford", "Rusukaina", // Guerra/Time-skip
  "Ilha dos Tritões", "Punk Hazard", "Dressrosa", "Zou", "Whole Cake Island", "Wano Kuni", "Egghead" // Novo Mundo
];

const CREW_DATA: Record<Crew, { icon: React.ReactNode; color: string }> = {
  Luffy: { icon: <Anchor size={14} />, color: 'bg-red-500' },
  Zoro: { icon: <Sword size={14} />, color: 'bg-green-600' },
  Robin: { icon: <BookOpen size={14} />, color: 'bg-purple-600' },
  Sanji: { icon: <Utensils size={14} />, color: 'bg-yellow-500' },
};

const COLUMNS_THEME = [
  { id: 'todo' as ColumnId, title: 'A Fazer', color: 'border-red-600', bg: 'bg-red-950/30', accent: 'text-red-500', icon: <Skull size={20} /> },
  { id: 'doing' as ColumnId, title: 'Em Progresso', color: 'border-orange-500', bg: 'bg-orange-950/30', accent: 'text-orange-400', icon: <Sailboat size={20} /> },
  { id: 'done' as ColumnId, title: 'Concluído', color: 'border-purple-600', bg: 'bg-purple-950/30', accent: 'text-purple-400', icon: <Coins size={20} /> },
];

export default function Gear5UltimateKanban() {
  const [tasks, setTasks] = useState<Record<ColumnId, Task[]>>({ todo: [], doing: [], done: [] });
  const [text, setText] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Crew>('Luffy');
  const [persistentBounty, setPersistentBounty] = useState(0); // RECOMPENSA QUE NÃO APAGA
  const [progress, setProgress] = useState(0);
  const [islandIndex, setIslandIndex] = useState(0);
  
  const ONE_PIECE_LOGO = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEintVRNqYNOGdlWN3tS9rA2_XJP-ebyb-5ZZeWhiLzWPBinliUFuvW86Iz4G5aDLCBzFGvx_POYsQz-QYEPiCWJPBYplD63fGzSsMOgluNoZIDCvA5L-X-sPOswZsSk4y8E8hxKp6hKYeo/s2750/logo+one+piece+1.png';
  const [isMounted, setIsMounted] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const savedTasks = localStorage.getItem('@kanban-tasks-v5');
    const savedIsland = localStorage.getItem('@kanban-island-index-v5');
    const savedBounty = localStorage.getItem('@kanban-persistent-bounty');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedIsland) setIslandIndex(parseInt(savedIsland));
    if (savedBounty) setPersistentBounty(parseInt(savedBounty));
    
    setIsMounted(true);
  }, []);

  // Salvar dados e calcular progresso
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('@kanban-tasks-v5', JSON.stringify(tasks));
      localStorage.setItem('@kanban-island-index-v5', islandIndex.toString());
      localStorage.setItem('@kanban-persistent-bounty', persistentBounty.toString());
      
      const total = tasks.todo.length + tasks.doing.length + tasks.done.length;
      const done = tasks.done.length;
      setProgress(total === 0 ? 0 : Math.round((done / total) * 100));
    }
  }, [tasks, islandIndex, persistentBounty, isMounted]);

  const nextIsland = () => {
    setIslandIndex((prev) => (prev + 1) % GRAND_LINE_ISLANDS.length);
    setTasks({ todo: [], doing: [], done: [] }); // Limpa o board mas NÃO o bounty
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newTask: Task = { 
      id: Date.now().toString(), 
      content: text, 
      bounty: Math.floor(Math.random() * 1000000) + 500000, // Recompensa entre 500k e 1.5M
      crew: selectedCrew 
    };
    setTasks(prev => ({ ...prev, todo: [newTask, ...prev.todo] }));
    setText('');
  };

  const moveTask = (currentCol: ColumnId, targetCol: ColumnId, taskId: string) => {
    const task = tasks[currentCol].find(t => t.id === taskId);
    if (!task) return;

    // Se a tarefa for movida para CONCLUÍDO, soma ao Bounty Persistente
    if (targetCol === 'done' && currentCol !== 'done') {
      setPersistentBounty(prev => prev + task.bounty);
    }
    // Se tirar de CONCLUÍDO, subtrai (opcional, para manter lógica)
    if (currentCol === 'done' && targetCol !== 'done') {
      setPersistentBounty(prev => Math.max(0, prev - task.bounty));
    }

    setTasks(prev => ({
      ...prev,
      [currentCol]: prev[currentCol].filter(t => t.id !== taskId),
      [targetCol]: [...prev[targetCol], task]
    }));
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-10 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-[url('https://wallpaperaccess.com/full/11020389.jpg')]" />
      <div className="fixed inset-0 z-10 bg-black/75 backdrop-blur-[2px]" />

      <div className="relative z-20 max-w-7xl mx-auto">
        
        {/* HEADER DE NAVEGAÇÃO E RECOMPENSA PERSISTENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-black/60 backdrop-blur-2xl border border-yellow-600/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600/20 rounded-full border border-yellow-600/50">
                <Trophy size={28} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-yellow-500">Bounty Histórico</p>
                <p className="text-2xl font-black text-white italic tracking-tighter">฿ {persistentBounty.toLocaleString()}</p>
              </div>
            </div>
            <Anchor className="text-yellow-600/30" size={40} />
          </div>

          <div className="bg-black/60 backdrop-blur-2xl border border-blue-600/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-full border border-blue-600/50">
                <Compass size={28} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400">Ilha Atual</p>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{GRAND_LINE_ISLANDS[islandIndex]}</h2>
              </div>
            </div>
            {progress === 100 && tasks.done.length > 0 && (
               <button onClick={nextIsland} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-black text-[10px] animate-bounce">
                 ZARPAR
               </button>
            )}
          </div>
        </div>

        {/* LOG POSE PROGRESS */}
        <div className="mb-12">
            <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest text-slate-400">
                <span>Progresso da Ilha</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-red-600 to-yellow-400 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
        </div>

        <header className="flex flex-col items-center gap-8 mb-16 border-b border-white/5 pb-12">
            <img src={ONE_PIECE_LOGO} alt="One Piece" className="w-64 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            
            <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4 w-full max-w-4xl bg-white/5 p-3 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                <div className="flex gap-2 p-1 bg-black/40 rounded-2xl overflow-x-auto no-scrollbar">
                {(Object.keys(CREW_DATA) as Crew[]).map(member => (
                    <button
                    key={member}
                    type="button"
                    onClick={() => setSelectedCrew(member)}
                    className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${selectedCrew === member ? `${CREW_DATA[member].color} text-white shadow-lg` : 'text-slate-400 hover:bg-white/5'}`}
                    >
                    {CREW_DATA[member].icon} <span>{member}</span>
                    </button>
                ))}
                </div>
                <input 
                className="bg-transparent flex-1 p-3 outline-none text-sm font-bold placeholder:text-white/20"
                placeholder="Qual é a próxima missão, capitão?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                />
                <button className="bg-white text-black px-10 py-3 rounded-2xl font-black hover:bg-yellow-500 transition-all text-xs">RECRUTAR</button>
            </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLUMNS_THEME.map((col) => (
            <div key={col.id} className="bg-black/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex flex-col min-h-[500px]">
              <div className={`p-6 border-b border-white/5 flex justify-between items-center rounded-t-[2.5rem] ${col.bg}`}>
                <h2 className="font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                  <span className={`${col.accent}`}>{col.icon}</span> {col.title}
                </h2>
                <span className="text-[10px] font-black opacity-40">{tasks[col.id].length}</span>
              </div>

              <div className="p-5 space-y-6">
                {tasks[col.id].map((task) => (
                  <div key={task.id} className={`relative bg-slate-900/90 p-6 rounded-[2rem] border-l-[6px] ${col.color} border-y border-r border-white/5 hover:bg-slate-800 transition-all`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <span className={`${CREW_DATA[task.crew].color} p-1 rounded-full`}>{CREW_DATA[task.crew].icon}</span>
                        <span className="text-[9px] font-bold text-slate-400">{task.crew}</span>
                      </div>
                      <span className="text-yellow-500 font-black text-[10px]">฿ {task.bounty.toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-bold mb-6 text-slate-200">{task.content}</p>
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      {col.id !== 'todo' && (
                        <button onClick={() => moveTask(col.id, col.id === 'done' ? 'doing' : 'todo', task.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400"><ChevronLeft size={16} /></button>
                      )}
                      {col.id !== 'done' ? (
                        <button onClick={() => moveTask(col.id, col.id === 'todo' ? 'doing' : 'done', task.id)} className="flex-1 bg-white text-black rounded-2xl text-[9px] font-black uppercase py-3 hover:bg-yellow-500">AVANÇAR</button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 text-[9px] font-black uppercase bg-emerald-500/10 rounded-2xl py-3 border border-emerald-500/20"><Check size={16} /> CONCLUÍDO</div>
                      )}
                      <button onClick={() => setTasks(prev => ({ ...prev, [col.id]: prev[col.id].filter(t => t.id !== task.id) }))} className="p-3 text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}