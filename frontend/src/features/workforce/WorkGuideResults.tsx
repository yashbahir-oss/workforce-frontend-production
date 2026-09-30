import { twClass } from "../../lib/tw";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { Link } from "react-router";
import { fileUrl, type PublicWorker } from "../../lib/api";

type GuideJob = {
  id: string;
  title: string;
  description?: string;
  categoryName?: string;
  skillNames?: string[];
  district?: string;
  taluka?: string;
  locality?: string;
  date?: string;
  workersNeeded?: number;
  customer?: string;
  imageUrl?: string;
};

type Props = {
  workers?: PublicWorker[];
  jobs?: GuideJob[];
  mode: "customer" | "worker";
};

/** Reusable result grid shared by Customer WorkGuide and Worker WorkGuide. */
export default function WorkGuideResults({ workers = [], jobs = [], mode }: Props) {
  if (mode === "customer" && !workers.length) return null;
  if (mode === "worker" && !jobs.length) return null;

  if (mode === "customer") {
    return (
      <section className={twClass('mt-4 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4')}>
        <div className={twClass('mb-3 flex items-center justify-between gap-2')}>
          <div><p className={twClass('text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600')}>WorkGuide results</p><h2 className={twClass('text-sm font-black text-slate-900')}>Verified workers matching your message</h2></div>
          <Link to="/find-workers" className={twClass('inline-flex items-center gap-1 text-[10px] font-black text-emerald-700')}>View all <ArrowRight size={12}/></Link>
        </div>
        <div className={twClass('grid gap-2 sm:grid-cols-2 lg:grid-cols-3')}>
          {workers.map((worker) => (
            <article key={worker.id} className={twClass('overflow-hidden rounded-xl border border-slate-200 bg-slate-50')}>
              <img src={fileUrl(worker.profileImage) || "/worker-carpenter.jpg"} onError={(e) => { e.currentTarget.src = "/worker-carpenter.jpg"; }} className={twClass('h-28 w-full object-cover')} alt={worker.name}/>
              <div className={twClass('p-3')}>
                <div className={twClass('flex items-start justify-between gap-2')}><h3 className={twClass('min-w-0 truncate text-xs font-black text-slate-900')}>{worker.name}</h3>{worker.verificationStatus === "approved" && <ShieldCheck size={14} className={twClass('shrink-0 text-emerald-600')}/>}</div>
                <p className={twClass('mt-1 truncate text-[10px] text-slate-500')}>{worker.profession || worker.headline || "Professional"}</p>
                <p className={twClass('mt-1 flex items-center gap-1 text-[9px] text-slate-500')}><MapPin size={10}/> {[worker.taluka, worker.district].filter(Boolean).join(", ") || "Location not specified"}</p>
                <div className={twClass('mt-2 flex items-center gap-2 text-[9px] text-slate-500')}><Star size={10} fill="currentColor" className={twClass('text-amber-500')}/> {worker.rating ? worker.rating.toFixed(1) : "—"} · {worker.experienceYears ?? "—"} years</div>
                <Link to={`/find-workers/${worker.id}`} className={twClass('mt-3 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-[10px] font-black text-white')}>View profile <ArrowRight size={11}/></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={twClass('mt-4 rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm sm:p-4')}>
      <div className={twClass('mb-3')}><p className={twClass('text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600')}>WorkGuide results</p><h2 className={twClass('text-sm font-black text-slate-900')}>Open work matching your message</h2></div>
      <div className={twClass('grid gap-2 sm:grid-cols-2')}>
        {jobs.map((job) => (
          <article key={job.id} className={twClass('overflow-hidden rounded-xl border border-slate-200 bg-slate-50')}>
            {job.imageUrl ? <img src={fileUrl(job.imageUrl)} onError={(e)=>{e.currentTarget.src="/worker-carpenter.jpg"}} className={twClass('h-32 w-full object-cover')} alt="Work requirement"/> : <img src="/worker-carpenter.jpg" className={twClass('h-20 w-full object-cover')} alt="Work requirement"/>}
            <div className={twClass('p-3')}><h3 className={twClass('text-xs font-black text-slate-900')}>{job.title}</h3><p className={twClass('mt-1 text-[10px] font-semibold text-slate-600')}>{job.customer || "Customer"}</p><p className={twClass('mt-1 flex items-center gap-1 text-[9px] text-slate-500')}><MapPin size={10}/>{[job.locality, job.taluka, job.district].filter(Boolean).join(", ") || "Location not specified"}</p><p className={twClass('mt-1 flex items-center gap-1 text-[9px] text-slate-500')}><CalendarDays size={10}/>{job.date ? new Date(job.date).toLocaleDateString() : "Date to be confirmed"} · <Users size={10}/>{job.workersNeeded || 1} worker(s)</p><div className={twClass('mt-2 flex flex-wrap gap-1')}>{(job.skillNames || []).slice(0,4).map((skill)=><span key={skill} className={twClass('rounded-full bg-white px-2 py-1 text-[8px] font-bold text-slate-600')}>{skill}</span>)}</div></div>
          </article>
        ))}
      </div>
    </section>
  );
}
