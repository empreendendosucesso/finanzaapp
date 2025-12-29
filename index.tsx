import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    Wallet, ChevronLeft, ChevronRight, Trash2, 
    ArrowUpRight, ArrowDownRight, Database, PieChart as PieChartIcon,
    Plus, RefreshCcw, Download, Upload, Info
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';

// --- Tipagens ---
type TransactionType = 'INCOME' | 'EXPENSE';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
}

const CATEGORIES = {
    INCOME: ['Salário', 'Investimentos', 'Freelance', 'Vendas', 'Presente', 'Outros'],
    EXPENSE: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros']
};

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#94a3b8'];

const App = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        try {
            const saved = localStorage.getItem('finanza_v5_data');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ 
        desc: '', 
        val: '', 
        type: 'EXPENSE' as TransactionType, 
        cat: 'Alimentação', 
        date: new Date().toISOString().split('T')[0] 
    });

    useEffect(() => {
        localStorage.setItem('finanza_v5_data', JSON.stringify(transactions));
    }, [transactions]);

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            const d = new Date(t.date + 'T12:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentMonth, currentYear]);

    const totals = useMemo(() => {
        return filtered.reduce((acc, t) => {
            if (t.type === 'INCOME') acc.inc += t.amount; else acc.exp += t.amount;
            return acc;
        }, { inc: 0, exp: 0 });
    }, [filtered]);

    const chartData = useMemo(() => {
        const categoriesMap: Record<string, number> = {};
        filtered.filter((t) => t.type === 'EXPENSE').forEach((t) => {
            categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
        });
        return Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Math.abs(parseFloat(form.val));
        if (!form.desc || isNaN(amount)) return;
        
        const newTransaction: Transaction = { 
            id: crypto.randomUUID(), 
            description: form.desc, 
            amount, 
            type: form.type, 
            category: form.cat, 
            date: form.date 
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        setForm({ ...form, desc: '', val: '' });
    };

    const clearAll = () => {
        if (window.confirm("Deseja apagar todos os lançamentos definitivamente?")) {
            setTransactions([]);
            localStorage.removeItem('finanza_v5_data');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(transactions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `finanza_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    setTransactions(json);
                    alert("Dados importados com sucesso!");
                } else {
                    alert("Formato de arquivo inválido.");
                }
            } catch (err) {
                alert("Erro ao ler o arquivo.");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                            <Wallet size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Finanza</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                            <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className="p-1.5 hover:text-indigo-600 transition-colors">
                                <ChevronLeft size={14}/>
                            </button>
                            <span className="text-[10px] font-black uppercase text-slate-500 w-28 text-center tracking-widest">
                                {monthNames[currentMonth]} {currentYear}
                            </span>
                            <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className="p-1.5 hover:text-indigo-600 transition-colors">
                                <ChevronRight size={14}/>
                            </button>
                        </div>
                        
                        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
                        
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={handleExport} 
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all" 
                                title="Exportar JSON"
                            >
                                <Download size={18} />
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all" 
                                title="Importar JSON"
                            >
                                <Upload size={18} />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".json" 
                                    onChange={handleImport} 
                                />
                            </button>
                            <button 
                                onClick={clearAll} 
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-all" 
                                title="Limpar dados"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
                {/* Dashboard */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-6 rounded-3xl shadow-sm border border-slate-200/50">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2 font-bold text-[10px] uppercase tracking-widest">
                                <ArrowUpRight size={14}/> Entradas
                            </div>
                            <div className="text-xl font-black text-slate-800">
                                R$ {totals.inc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl shadow-sm border border-slate-200/50">
                            <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-[10px] uppercase tracking-widest">
                                <ArrowDownRight size={14}/> Saídas
                            </div>
                            <div className="text-xl font-black text-slate-800">
                                R$ {totals.exp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
                            <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase opacity-60 tracking-widest">
                                Saldo Líquido
                            </div>
                            <div className="text-xl font-black">
                                R$ {(totals.inc - totals.exp).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[350px] flex flex-col">
                        <div className="font-bold text-[10px] uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                            <PieChartIcon size={14} /> Distribuição de Gastos por Categoria
                        </div>
                        <div className="flex-1 w-full min-h-[250px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                            {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Aguardando lançamentos de despesas</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 px-8 border-b border-slate-50 flex justify-between items-center">
                            <span className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Extrato de {monthNames[currentMonth]}</span>
                            <span className="text-[10px] font-black text-slate-300">{filtered.length} Transações</span>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filtered.map((t) => (
                                <div key={t.id} className="p-5 px-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {t.type === 'INCOME' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-800">{t.description}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.category} • {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`font-black text-sm tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button onClick={() => setTransactions(prev => prev.filter((x) => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="py-20 text-center text-slate-300 flex flex-col items-center gap-3">
                                    <Database size={32} strokeWidth={1}/>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nenhum dado neste mês</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lateral: Formulário */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
                        <h3 className="font-black text-[10px] uppercase text-slate-400 mb-8 flex items-center gap-2 tracking-widest"><Plus size={16} className="text-indigo-600"/> Novo Registro</h3>
                        <form onSubmit={handleAdd} className="space-y-5">
                            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                                <button type="button" onClick={() => setForm({...form, type: 'EXPENSE', cat: 'Alimentação'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>SAÍDA</button>
                                <button type="button" onClick={() => setForm({...form, type: 'INCOME', cat: 'Salário'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>ENTRADA</button>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Descrição</label>
                                <input type="text" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors" placeholder="Ex: Mercado" required />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Valor</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">R$</span>
                                    <input type="number" step="0.01" value={form.val} onChange={e => setForm({...form, val: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 transition-colors pl-10" placeholder="0,00" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Categoria</label>
                                    <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none cursor-pointer">
                                        {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Data</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none" />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 mt-4">Salvar Lançamento</button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="mt-12 py-8 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400">
                    <div className="flex items-center gap-2">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Armazenamento Local Ativado</span>
                    </div>
                    <p className="text-[10px] font-medium leading-relaxed max-w-md text-center md:text-right opacity-60">
                        Seus dados financeiros são salvos exclusivamente no seu navegador. Nenhuma informação é enviada para servidores externos, garantindo total privacidade. Recomenda-se exportar backups regularmente.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}
