'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Anchor, Plus, ChevronRight, ChevronLeft, Check, Pencil, Skull, Sailboat, Coins, Sword, BookOpen, Utensils } from 'lucide-react';

type Crew = 'Luffy' | 'Zoro' | 'Robin' | 'Sanji';
type Task = { id: string; content: string; bounty: number; crew: Crew };
type ColumnId = 'todo' | 'doing' | 'done';

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
  const [totalBounty, setTotalBounty] = useState(0);
  
  const ONE_PIECE_LOGO = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEintVRNqYNOGdlWN3tS9rA2_XJP-ebyb-5ZZeWhiLzWPBinliUFuvW86Iz4G5aDLCBzFGvx_POYsQz-QYEPiCWJPBYplD63fGzSsMOgluNoZIDCvA5L-X-sPOswZsSk4y8E8hxKp6hKYeo/s2750/logo+one+piece+1.png';

  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('@kanban-tasks-ultimate');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed);
      // Calcular bounty inicial das tarefas em 'done'
      const doneBounty = (parsed.done as Task[]).reduce((acc, curr) => acc + curr.bounty, 0);
      setTotalBounty(doneBounty);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('@kanban-tasks-ultimate', JSON.stringify(tasks));
      const currentBounty = tasks.done.reduce((acc, curr) => acc + curr.bounty, 0);
      setTotalBounty(currentBounty);
    }
  }, [tasks, isMounted]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newTask: Task = { 
      id: Date.now().toString(), 
      content: text, 
      bounty: Math.floor(Math.random() * 500000) + 100000, // Bounty aleatório entre 100k e 600k
      crew: selectedCrew 
    };
    setTasks(prev => ({ ...prev, todo: [newTask, ...prev.todo] }));
    setText('');
  };

  const moveTask = (currentCol: ColumnId, targetCol: ColumnId, taskId: string) => {
    const task = tasks[currentCol].find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => ({
      ...prev,
      [currentCol]: prev[currentCol].filter(t => t.id !== taskId),
      [targetCol]: [...prev[targetCol], task]
    }));
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-10 relative overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-[url('https://wallpaperaccess.com/full/11020389.jpg')]" />
      <div className="fixed inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-20 max-w-7xl mx-auto">
        
        <header className="flex flex-col gap-8 mb-12 border-b border-white/10 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
            
            {/* BOUNTY POSTER STYLE STATS */}
            <div className="bg-yellow-600/20 border-2 border-yellow-600/50 p-4 rounded-xl backdrop-blur-md flex items-center gap-6 shadow-[0_0_20px_rgba(202,138,4,0.2)]">
               <div className="text-center">
                 <p className="text-[10px] uppercase font-black tracking-[0.2em] text-yellow-500">Wanted Total Bounty</p>
                 <p className="text-3xl font-black text-white italic drop-shadow-lg">฿ {totalBounty.toLocaleString()}</p>
               </div>
               <div className="h-10 w-[1px] bg-yellow-600/30" />
               <Anchor className="text-yellow-500 animate-bounce" size={32} />
            </div>

            <div className="w-56 md:w-72 transform hover:rotate-2 transition-transform">
              <img src={ONE_PIECE_LOGO} alt="One Piece" className="w-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            </div>
          </div>

          <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto w-full bg-white/5 p-3 rounded-3xl border border-white/20 backdrop-blur-2xl shadow-2xl">
            <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              {(Object.keys(CREW_DATA) as Crew[]).map(member => (
                <button
                  key={member}
                  type="button"
                  onClick={() => setSelectedCrew(member)}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${selectedCrew === member ? `${CREW_DATA[member].color} text-white shadow-lg` : 'text-slate-400 hover:bg-white/5'}`}
                >
                  {CREW_DATA[member].icon} <span className="hidden lg:block">{member}</span>
                </button>
              ))}
            </div>
            <input 
              className="bg-transparent flex-1 p-3 outline-none text-sm font-bold placeholder:text-white/20"
              placeholder="Nova missão para a tripulação..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all uppercase text-xs shadow-xl">
              Recrutar
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLUMNS_THEME.map((col) => (
            <div key={col.id} className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col min-h-[600px] shadow-2xl">
              <div className={`p-6 border-b border-white/5 flex justify-between items-center rounded-t-[2.5rem] ${col.bg}`}>
                <h2 className="font-black uppercase text-sm tracking-widest flex items-center gap-3">
                  <span className={`${col.accent}`}>{col.icon}</span> {col.title}
                </h2>
                <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black italic">Qty: {tasks[col.id].length}</span>
              </div>

              <div className="p-5 space-y-6">
                {tasks[col.id].map((task) => (
                  <div key={task.id} className={`
                    relative group bg-slate-900/80 p-6 rounded-[2rem] border-l-[6px] ${col.color} border-y border-r border-white/5 
                    transition-all duration-500 hover:bg-slate-800/90 shadow-xl
                    ${col.id === 'doing' ? 'animate-[pulse_4s_infinite] shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''}
                  `}>
                    {/* GEAR 5 SMOKE EFFECT (Sombra branca suave) */}
                    <div className="absolute inset-0 rounded-[2rem] bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <span className={`${CREW_DATA[task.crew].color} p-1 rounded-full`}>{CREW_DATA[task.crew].icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-300">{task.crew}</span>
                      </div>
                      <span className="text-yellow-500 font-black text-xs tracking-tighter">฿ {task.bounty.toLocaleString()}</span>
                    </div>

                    <p className="text-sm font-bold leading-relaxed mb-6 group-hover:text-white transition-colors capitalize">{task.content}</p>

                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      {col.id !== 'todo' && (
                        <button onClick={() => moveTask(col.id, col.id === 'done' ? 'doing' : 'todo', task.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-transform active:scale-75">
                          <ChevronLeft size={16} />
                        </button>
                      )}
                      
                      {col.id !== 'done' ? (
                        <button 
                          onClick={() => moveTask(col.id, col.id === 'todo' ? 'doing' : 'done', task.id)}
                          className="flex-1 bg-white text-black rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 hover:bg-yellow-500 shadow-lg active:scale-95"
                        >
                          Zarpar <ChevronRight size={14} />
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 rounded-2xl py-3 border border-emerald-500/20">
                          <Check size={16} /> Missão Cumprida
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setTasks(prev => ({ ...prev, [col.id]: prev[col.id].filter(t => t.id !== task.id) }))}
                        className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
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