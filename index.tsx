
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    Wallet, Sparkles, ChevronLeft, ChevronRight, BrainCircuit, Trash2, 
    ArrowUpRight, ArrowDownRight, Database, PieChart as PieChartIcon
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAÇÕES ---
const TransactionType = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const;
type TTransactionType = typeof TransactionType[keyof typeof TransactionType];

const CATEGORIES = {
    INCOME: ['Salário', 'Investimentos', 'Freelance', 'Vendas', 'Outros'],
    EXPENSE: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Assinaturas', 'Outros']
};

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const App = () => {
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('finanza_v4_data');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [insights, setInsights] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const [form, setForm] = useState({ desc: '', val: '', type: 'EXPENSE' as TTransactionType, cat: 'Alimentação', date: new Date().toISOString().split('T')[0] });

    useEffect(() => localStorage.setItem('finanza_v4_data', JSON.stringify(transactions)), [transactions]);

    const filtered = useMemo(() => transactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, currentMonth, currentYear]);

    const totals = useMemo(() => filtered.reduce((acc: any, t: any) => {
        if (t.type === 'INCOME') acc.inc += t.amount; else acc.exp += t.amount;
        return acc;
    }, { inc: 0, exp: 0 }), [filtered]);

    const chartData = useMemo(() => {
        const categoriesMap: Record<string, number> = {};
        filtered.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
            categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
        });
        return Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Math.abs(parseFloat(form.val));
        if (!form.desc || isNaN(amount)) return;
        setTransactions([{ id: crypto.randomUUID(), description: form.desc, amount, type: form.type, category: form.cat, date: form.date }, ...transactions]);
        setForm({ ...form, desc: '', val: '' });
    };

    const handleAI = async () => {
        setLoadingAI(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Analise minhas finanças de ${currentMonth+1}/${currentYear}: Ganhos R$${totals.inc}, Gastos R$${totals.exp}. Liste 3 conselhos rápidos com emojis. Seja breve.`;
            
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt 
            });
            
            setInsights(response.text || null);
        } catch (e) { 
            console.error('Gemini API Error:', e);
            alert('Erro ao gerar insights. Tente novamente em instantes.');
        }
        setLoadingAI(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-200"><Wallet size={18} /></div>
                        <span className="font-black text-lg tracking-tight">Finanza AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full gap-3 border border-slate-200">
                            <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className="hover:text-indigo-600 transition-colors p-1"><ChevronLeft size={16}/></button>
                            <span className="text-[10px] font-black uppercase text-slate-500 w-20 text-center tracking-widest">{['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][currentMonth]}</span>
                            <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className="hover:text-indigo-600 transition-colors p-1"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Cards de Totais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2"><ArrowUpRight size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Entradas</span></div>
                            <div className="text-2xl font-black text-slate-800">R$ {totals.inc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-2 text-rose-600 mb-2"><ArrowDownRight size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Saídas</span></div>
                            <div className="text-2xl font-black text-slate-800">R$ {totals.exp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/><span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Saldo Atual</span></div>
                            <div className="text-2xl font-black">R$ {(totals.inc - totals.exp).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gráfico de Despesas */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <PieChartIcon size={16} className="text-slate-400" />
                                <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Gastos por Categoria</span>
                            </div>
                            <div className="h-[240px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                        <Database size={32} className="mb-2 opacity-20" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sem dados de gastos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Box IA */}
                        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[2rem] text-white relative overflow-hidden group flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700"><BrainCircuit size={100}/></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="text-indigo-300" size={20} />
                                    <h3 className="font-black text-xs uppercase tracking-widest">Insights Gemini</h3>
                                </div>
                                {insights ? (
                                    <p className="text-sm leading-relaxed text-indigo-50 animate-in font-medium">{insights}</p>
                                ) : (
                                    <p className="text-sm text-indigo-200/60 font-medium">Analise seus padrões de consumo deste mês com inteligência artificial.</p>
                                )}
                            </div>
                            <button onClick={handleAI} disabled={loadingAI} className="mt-6 w-full py-4 bg-white text-indigo-900 hover:bg-indigo-50 disabled:opacity-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 z-10">
                                {loadingAI ? 'Analisando...' : 'Consultar IA'}
                            </button>
                        </div>
                    </div>

                    {/* Lista de Transações */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Extrato Detalhado</span>
                            <span className="text-[9px] font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">{filtered.length} lançamentos</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {filtered.map((t: any) => (
                                <div key={t.id} className="p-5 px-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {t.type === 'INCOME' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-800">{t.description}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`font-black text-sm tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button onClick={() => setTransactions(transactions.filter((x: any) => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="py-24 text-center">
                                    <Database className="mx-auto text-slate-200 mb-4" size={40} />
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Nenhuma movimentação neste período</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
                        <h3 className="font-black text-[10px] uppercase text-slate-400 mb-8 tracking-widest">Novo Registro</h3>
                        <form onSubmit={handleAdd} className="space-y-5">
                            <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                <button type="button" onClick={() => setForm({...form, type: 'EXPENSE', cat: 'Alimentação'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>SAÍDA</button>
                                <button type="button" onClick={() => setForm({...form, type: 'INCOME', cat: 'Salário'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>ENTRADA</button>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Descrição</label>
                                <input type="text" placeholder="Ex: Aluguel, Supermercado..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                                    <input type="number" step="0.01" placeholder="0,00" value={form.val} onChange={e => setForm({...form, val: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Categoria</label>
                                <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none appearance-none cursor-pointer hover:border-slate-300">
                                    {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 uppercase mt-2">Salvar Transação</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
