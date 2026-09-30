import { twClass } from "../../lib/tw";
import { Bot, CalendarCheck2, Search, Send, UserRound, Sparkles } from "lucide-react";
import { useState } from "react";
import { aiApi } from "../../lib/api";
import { useAuthStore } from "../auth/auth.store";
import { toast } from "sonner";
import WorkGuideResults from "../workforce/WorkGuideResults";

export default function WorkerWorkGuidePage() {
  const { token } = useAuthStore();
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const ask = async (value = input) => {
    const q = value.trim();
    if (!q || busy) return;
    setBusy(true);
    try {
      const result = await aiApi.ask(token || undefined, q, { role: "worker" });
      setAnswer(result.answer);
      setJobs(result.jobs || []);
      setInput("");
    } catch (e) {
      setJobs([]);
      toast.error(e instanceof Error ? e.message : "WorkGuide is unavailable");
    } finally { setBusy(false); }
  };

  const suggestions = ["Find electrician jobs in Pune", "Find nearby work", "Explain my booking", "How do I improve my profile?"];
  return <div className={twClass('space-y-5')}><div><h1 className={twClass('text-2xl font-black')}>WorkGuide</h1><p className={twClass('mt-1 text-sm text-slate-500')}>Ask about work, bookings, profile or verification. Matching work comes from live WORKFORCE data.</p></div><div className={twClass('grid gap-5 lg:grid-cols-[1fr_280px]')}><section className={twClass('flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm')}><header className={twClass('flex items-center gap-3 border-b border-slate-200 p-4')}><span className={twClass('grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700')}><Bot size={20}/></span><div><h2 className={twClass('font-black')}>WorkGuide Assistant</h2><p className={twClass('text-[10px] text-emerald-700')}>Backend connected</p></div></header><div className={twClass('flex-1 overflow-y-auto p-4 sm:p-6')}>{answer?<div className={twClass('max-w-[85%] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700')}>{answer}</div>:<div className={twClass('grid min-h-[330px] place-items-center text-center text-sm text-slate-400')}><div><Sparkles className={twClass('mx-auto mb-3 text-emerald-500')}/><p>Ask WorkGuide to find real open work opportunities.</p></div></div>}</div><div className={twClass('border-t border-slate-200 p-2.5')}><div className={twClass('flex items-center gap-2')}><input className={twClass('min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500')} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key === "Enter" && void ask()} placeholder="Ask WorkGuide..."/><button disabled={busy || !input.trim()} onClick={()=>void ask()} className={twClass('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white disabled:opacity-40')}><Send size={17}/></button></div></div></section><aside className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}><h2 className={twClass('font-black')}>Quick help</h2><div className={twClass('mt-4 grid gap-2')}>{suggestions.map((s,i)=><button key={s} onClick={()=>{setInput(s);void ask(s)}} className={twClass('flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50')}>{i===0?<Search size={14}/>:i===1?<Search size={14}/>:i===2?<CalendarCheck2 size={14}/>:<UserRound size={14}/>} {s}</button>)}</div></aside></div><WorkGuideResults mode="worker" jobs={jobs}/></div>;
}
