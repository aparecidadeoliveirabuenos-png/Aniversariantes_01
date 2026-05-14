/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Cake, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  ChevronRight,
  Gift,
  Settings,
  X
} from 'lucide-react';
import { Birthday, BirthdayStatus } from './types';

export default function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);
  
  // States for new birthday form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<BirthdayStatus>('não iniciado');

  useEffect(() => {
    fetchConfig();
    fetchBirthdays();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setDbConfigured(data.supabaseConfigured);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBirthdays = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/birthdays');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao carregar dados');
      }
      const data = await res.json();
      setBirthdays(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDate) return;

    try {
      const res = await fetch('/api/birthdays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, date: newDate, status: newStatus }),
      });
      if (!res.ok) throw new Error('Falha ao adicionar');
      const added = await res.json();
      setBirthdays(prev => [...prev, added].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewName('');
      setNewDate('');
      setIsAdding(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: BirthdayStatus) => {
    const statuses: BirthdayStatus[] = ['não iniciado', 'em andamento', 'concluido'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      const res = await fetch(`/api/birthdays/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      const updated = await res.json();
      setBirthdays(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const res = await fetch(`/api/birthdays/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      setBirthdays(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusIcon = (status: BirthdayStatus) => {
    switch (status) {
      case 'concluido': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'em andamento': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-pink-100 p-3 rounded-2xl">
              <Cake className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">FestaFest</h1>
              <p className="text-slate-500 text-sm font-medium">Gestor de Celebrações</p>
            </div>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-medium shadow-lg shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar</span>
          </motion.button>
        </header>

        {/* Database Configuration Warning */}
        {!dbConfigured && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-xl mt-0.5">
                <Settings className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 text-lg font-display">Supabase não configurado</h3>
                <p className="text-amber-800/80 leading-relaxed text-sm">
                  Para o sistema funcionar, você precisa adicionar as credenciais do Supabase no arquivo <code className="bg-amber-100 px-1.5 py-0.5 rounded text-sm font-mono">.env</code>.
                </p>
                <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-amber-200/50">
                  <p className="text-sm font-mono text-amber-700 break-all">
                    SUPABASE_URL=seu-projeto.supabase.co<br/>
                    SUPABASE_ANON_KEY=sua-chave-anonima
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        <section className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total', count: birthdays.length, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Pendente', count: birthdays.filter(b => b.status !== 'concluido').length, color: 'bg-amber-50 text-amber-600' },
            { label: 'Concluído', count: birthdays.filter(b => b.status === 'concluido').length, color: 'bg-green-50 text-green-600' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${stat.color} p-4 rounded-3xl flex flex-col items-center justify-center`}
            >
              <span className="text-2xl font-bold">{stat.count}</span>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">{stat.label}</span>
            </motion.div>
          ))}
        </section>

        {/* Birthday List */}
        <main className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-medium">Carregando celebrações...</p>
            </div>
          ) : birthdays.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 px-8 flex flex-col items-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Gift className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum aniversariante</h2>
              <p className="text-slate-500 max-w-xs mx-auto">
                Comece adicionando seu primeiro amigo ou familiar para acompanhar a organização.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {birthdays.map((birthday, idx) => (
                <motion.div
                  key={birthday.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 group hover:border-pink-100 hover:shadow-md transition-all"
                >
                  <div className={`p-4 rounded-2xl flex-shrink-0 ${birthday.status === 'concluido' ? 'bg-green-50' : 'bg-slate-50'}`}>
                    <Calendar className={`w-6 h-6 ${birthday.status === 'concluido' ? 'text-green-600' : 'text-slate-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate flex items-center gap-2 font-display">
                       {birthday.name}
                       {birthday.status === 'concluido' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Festa Feita!</span>}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">{formatDate(birthday.date)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(birthday.id, birthday.status)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-colors"
                    >
                      {getStatusIcon(birthday.status)}
                      <span className="hidden sm:inline capitalize">{birthday.status}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(birthday.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Add Birthday Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 font-display">Novo Aniversariante</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddBirthday} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Nome</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Quem é o(a) sortudo(a)?"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-pink-100 transition-all text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Data de Nascimento</label>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-pink-100 transition-all text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Status Inicial</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['não iniciado', 'em andamento', 'concluido'] as BirthdayStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewStatus(s)}
                        className={`py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                          newStatus === s 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-2xl mt-4 shadow-xl shadow-pink-200 transition-all active:scale-95"
                >
                  Adicionar Celebrate!
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

