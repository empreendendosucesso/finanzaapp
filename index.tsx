
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    Wallet, Sparkles, ChevronLeft, ChevronRight, BrainCircuit, Trash2, 
    Settings, X, Lock, TrendingUp, ArrowUpRight, ArrowDownRight, Database
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAÇÕES ---
const TransactionType = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const;
type TTransactionType = typeof TransactionType[keyof typeof TransactionType];

const CATEGORIES = {
    INCOME: ['Salário', 'Investimentos', 'Freelance', 'Vendas', 'Outros'],
    EXPENSE: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Assinaturas', 'Outros']
};

const CATEGORY_COLORS: Record<string, string> = {
    'Alimentação': '#F43F5E', 'Moradia': '#3B82F6', 'Transporte': '#F59E0B',
    'Lazer': '#8B5CF6', 'Saúde': '#10B981', 'Salário': '#10B981', 'Outros': '#94A3B8'
};

const App = () => {
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('finanza_v4_data');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [apiKey, setApiKey] = useState(localStorage.getItem('finanza_api_key') || '');
    const [showSettings, setShowSettings] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [insights, setInsights] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const [form, setForm] = useState({ desc: '', val: '', type: 'EXPENSE' as TTransactionType, cat: 'Alimentação', date: new Date().toISOString().split('T')[0] });

    useEffect(() => localStorage.setItem('finanza_v4_data', JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem('finanza_api_key', apiKey), [apiKey]);

    const filtered = useMemo(() => transactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, currentMonth, currentYear]);

    const totals = useMemo(() => filtered.reduce((acc: any, t: any) => {
        if (t.type === 'INCOME') acc.inc += t.amount; else acc.exp += t.amount;
        return acc;
    }, { inc: 0, exp: 0 }), [filtered]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Math.abs(parseFloat(form.val));
        if (!form.desc || isNaN(amount)) return;
        setTransactions([{ id: crypto.randomUUID(), description: form.desc, amount, type: form.type, category: form.cat, date: form.date }, ...transactions]);
        setForm({ ...form, desc: '', val: '' });
    };

    const handleAI = async () => {
        if (!apiKey) { setShowSettings(true); return; }
        setLoadingAI(true);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Analise minhas finanças de ${currentMonth+1}/${currentYear}: Ganhos R$${totals.inc}, Gastos R$${totals.exp}. Dê 3 dicas curtas com emojis.`;
            const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setInsights(res.text || null);
        } catch (e) { alert('Erro na Chave de API ou Conexão.'); }
        setLoadingAI(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
            {/* Nav */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-indigo-600" size={24} />
                        <span className="font-black text-xl tracking-tight">Finanza AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 gap-3">
                            <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}><ChevronLeft size={16}/></button>
                            <span className="text-[10px] font-black uppercase text-slate-500 w-16 text-center">{['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][currentMonth]}</span>
                            <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}><ChevronRight size={16}/></button>
                        </div>
                        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Settings size={20}/></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Resumo */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2"><ArrowUpRight size={14}/><span className="text-[10px] font-black uppercase">Entradas</span></div>
                            <div className="text-xl font-black">R$ {totals.inc.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-rose-600 mb-2"><ArrowDownRight size={14}/><span className="text-[10px] font-black uppercase">Saídas</span></div>
                            <div className="text-xl font-black">R$ {totals.exp.toLocaleString()}</div>
                        </div>
                        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
                            <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-300"/><span className="text-[10px] font-black uppercase opacity-80">Saldo</span></div>
                            <div className="text-xl font-black">R$ {(totals.inc - totals.exp).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Insights IA */}
                    <div className="bg-[#1E1B4B] p-8 rounded-[2rem] text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <BrainCircuit className="text-indigo-400" />
                                <h3 className="font-black text-xs uppercase tracking-widest">Análise de Inteligência Artificial</h3>
                            </div>
                            {insights ? (
                                <p className="text-xs leading-relaxed text-indigo-100 animate-in">{insights}</p>
                            ) : (
                                <p className="text-xs text-indigo-300 opacity-60">Clique no botão para analisar suas movimentações deste mês.</p>
                            )}
                            <button onClick={handleAI} disabled={loadingAI} className="mt-6 w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                {loadingAI ? 'Processando...' : 'Gerar Insights Gemini'}
                            </button>
                        </div>
                    </div>

                    {/* Extrato */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 font-black text-[10px] uppercase text-slate-400">Últimas Transações</div>
                        <div className="divide-y divide-slate-50">
                            {filtered.map((t: any) => (
                                <div key={t.id} className="p-4 px-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{t.description}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase">{t.category} • {new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-black text-sm ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                                        </span>
                                        <button onClick={() => setTransactions(transactions.filter((x: any) => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && <div className="py-20 text-center text-xs font-bold text-slate-300 uppercase">Sem dados este mês</div>}
                        </div>
                    </div>
                </div>

                {/* Lateral: Form */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm sticky top-24">
                        <h3 className="font-black text-[10px] uppercase text-slate-400 mb-6">Novo Registro</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button type="button" onClick={() => setForm({...form, type: 'EXPENSE', cat: 'Alimentação'})} className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all ${form.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>SAÍDA</button>
                                <button type="button" onClick={() => setForm({...form, type: 'INCOME', cat: 'Salário'})} className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all ${form.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>ENTRADA</button>
                            </div>
                            <input type="text" placeholder="Descrição" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" required />
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                                <input type="number" placeholder="0,00" value={form.val} onChange={e => setForm({...form, val: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl text-lg font-black outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black outline-none appearance-none cursor-pointer">
                                {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">SALVAR TRANSACAO</button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Modal Settings */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in">
                        <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600"><X size={20}/></button>
                        <h2 className="text-xl font-black mb-2">Configurações</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Sua privacidade em primeiro lugar</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Gemini API Key</label>
                                <input 
                                    type="password" 
                                    value={apiKey} 
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="Cole sua chave aqui..." 
                                    className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-mono outline-none border border-slate-100 focus:border-indigo-500"
                                />
                                <a href="https://aistudio.google.com/" target="_blank" className="text-[9px] text-indigo-500 font-bold mt-2 inline-block hover:underline">Obter chave gratuita no Google AI Studio →</a>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2 text-slate-600"><Lock size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Segurança</span></div>
                                <p className="text-[9px] leading-relaxed text-slate-400 font-bold uppercase italic">Os dados são armazenados localmente no seu navegador. Nenhuma informação financeira sai daqui.</p>
                            </div>

                            <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase">Salvar e Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
