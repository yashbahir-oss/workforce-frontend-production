import { twClass } from "../../lib/tw";
import { useEffect } from "react";
import { Clock3, FileCheck2, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { authApi } from "../../lib/api";
import { useAuthStore } from "../auth/auth.store";

export default function WorkerPendingPage() {
  const navigate = useNavigate();
  const { user, token, setAuth, logout } = useAuthStore();
  const rejected = user?.verificationStatus === "rejected";

  useEffect(() => {
    if (!token) return;
    const check = async () => {
      try {
        const result = await authApi.me(token);
        setAuth(token, result.user);
        if (result.user.role === "worker" && result.user.verificationStatus === "verified") navigate("/worker", { replace: true });
      } catch { /* keep the pending screen; auth errors are handled by the main API layer */ }
    };
    void check();
    const id = window.setInterval(() => void check(), 10000);
    return () => window.clearInterval(id);
  }, [navigate, setAuth, token]);

  const signOut = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <main className={twClass('min-h-screen bg-[linear-gradient(135deg,#eef7ff_0%,#f8fbff_50%,#eefaf5_100%)] px-4 py-6 sm:px-6 lg:px-10')}>
      <div className={twClass('mx-auto max-w-6xl')}>
        <header className={twClass('flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-6')}>
          <div className={twClass('flex items-center gap-3')}><img src="/workforce-logo.png" alt="WORKFORCE" className={twClass('h-10 w-auto')}/><div><b className={twClass('text-sm text-slate-900')}>WORK<span className={twClass('text-emerald-600')}>FORCE</span></b><p className={twClass('text-[10px] text-slate-500')}>Worker verification</p></div></div>
          <button type="button" onClick={signOut} className={twClass('inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:border-red-200 hover:text-red-600')}><LogOut size={15}/> Logout</button>
        </header>

        <section className={twClass('mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50')}>
          <div className={twClass('relative min-h-40 overflow-hidden bg-slate-900 sm:min-h-52')}><img src="/workforce-hero-clean.jpg" alt="WORKFORCE worker" className={twClass('absolute inset-0 h-full w-full object-cover opacity-90')}/><div className={twClass('absolute inset-0 bg-slate-950/35')}/><div className={twClass('relative z-10 flex h-full min-h-40 flex-col justify-center p-6 text-white sm:min-h-52 sm:p-10')}><p className={twClass('text-sm font-semibold text-emerald-200')}>WORKFORCE Worker Application</p><h1 className={twClass('mt-2 text-2xl font-black sm:text-4xl')}>Hello {user?.name || "Worker"} 👋</h1><p className={twClass('mt-2 max-w-2xl text-sm text-white/90 sm:text-base')}>Your worker registration is submitted successfully. We will notify you after Admin reviews your selfie and verification documents.</p></div></div>

          <div className={twClass('grid gap-5 p-5 sm:p-8 lg:grid-cols-[1.35fr_.65fr]')}>
            <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 sm:p-7')}>
              <div className={twClass('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between')}><div className={twClass('flex items-center gap-4')}><div className={twClass(`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${rejected ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`)}>{rejected ? <ShieldAlert size={28}/> : <FileCheck2 size={28}/>}</div><div><h2 className={twClass('text-xl font-black text-slate-900')}>{rejected ? "Verification requires an update" : "Application Pending"}</h2><p className={twClass('mt-1 text-sm text-slate-500')}>{rejected ? "Admin has requested a correction before Worker access can be enabled." : "Your application is currently under review by our Admin team."}</p></div></div><span className={twClass(`w-fit rounded-full px-3 py-1.5 text-xs font-black ${rejected ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`)}>{rejected ? "Action Required" : "Pending Review"}</span></div>
              {rejected && user?.verificationRejectionReason && <div className={twClass('mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800')}><b>Admin message</b><p className={twClass('mt-1')}>{user.verificationRejectionReason}</p></div>}
              <div className={twClass('mt-7 space-y-0')}>
                <TimelineRow done title="Registration Completed" text="Your Worker account was created successfully." />
                <TimelineRow active={!rejected} done={false} title="Document Verification" text="Admin is reviewing your Aadhaar / ID and submitted information." />
                <TimelineRow done={false} title="Profile Verification" text="Your worker profile will be enabled after verification." />
                <TimelineRow done={false} last title="Account Activated" text="You will receive a notification when Worker access is approved." />
              </div>
            </section>

            <aside className={twClass('space-y-4')}>
              <div className={twClass('rounded-2xl border border-blue-100 bg-blue-50 p-5')}><div className={twClass('flex items-center gap-3')}><Clock3 className={twClass('text-blue-600')}/><h3 className={twClass('font-black text-slate-900')}>What happens next?</h3></div><ul className={twClass('mt-4 space-y-3 text-sm text-slate-600')}><li className={twClass('flex gap-2')}><ShieldCheck size={16} className={twClass('mt-0.5 text-emerald-600')}/> Admin checks your selfie and Aadhaar document.</li><li className={twClass('flex gap-2')}><ShieldCheck size={16} className={twClass('mt-0.5 text-emerald-600')}/> Your Worker UI stays locked during verification.</li><li className={twClass('flex gap-2')}><ShieldCheck size={16} className={twClass('mt-0.5 text-emerald-600')}/> After approval, you can access Find Work, Applications, Bookings and Messages.</li></ul></div>
              <div className={twClass('overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-5')}><div className={twClass('flex items-center gap-4')}><div className={twClass('h-16 w-16 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm')}><img src={user?.profileImage || "/workforce-logo.png"} alt="Your signup selfie" className={twClass('h-full w-full object-cover')}/></div><div><p className={twClass('text-xs font-bold text-emerald-700')}>Signup selfie</p><p className={twClass('mt-1 text-sm font-black text-slate-900')}>Used as your Worker profile photo</p><p className={twClass('mt-1 text-xs text-slate-600')}>It cannot be replaced from the Worker profile.</p></div></div></div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function TimelineRow({ title, text, done, active, last=false }: { title:string; text:string; done:boolean; active?:boolean; last?:boolean }) {
  return <div className={twClass('relative flex gap-4 pb-7 last:pb-0')}><div className={twClass('relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-4 border-white bg-slate-200 text-xs font-black text-slate-500 shadow-sm')}>{done ? <ShieldCheck size={18} className={twClass('text-white')}/> : active ? <Clock3 size={17} className={twClass('text-white')}/> : ""}</div>{!last && <span className={twClass('absolute left-[17px] top-8 h-[calc(100%-1.6rem)] w-0.5 bg-slate-200')}/>}<div className={twClass('min-w-0')}><h3 className={twClass('font-black text-slate-800')}>{title}</h3><p className={twClass('mt-1 text-sm leading-6 text-slate-500')}>{text}</p><span className={twClass(`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${done ? "bg-emerald-50 text-emerald-700" : active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`)}>{done ? "Completed" : active ? "Pending" : "Pending"}</span></div></div>;
}
