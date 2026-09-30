import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, MapPin, Users } from "lucide-react";
import { adminApi } from "../../lib/api";
import { toast } from "sonner";
export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => {
    void adminApi
      .jobs()
      .then((r) => setJobs(r.jobs || []))
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Unable to load jobs"),
      );
  }, []);
  return (
    <div className={twClass('space-y-5')}>
      <div>
        <p className={twClass('text-xs font-black uppercase tracking-[.16em] text-emerald-600')}>
          Operations
        </p>
        <h1 className={twClass('text-2xl font-black')}>Jobs</h1>
        <p className={twClass('text-sm text-slate-500')}>Live customer requirements.</p>
      </div>
      <div className={twClass('grid gap-3')}>
        {jobs.map((j) => (
          <article
            key={j._id}
            className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}
          >
            <div className={twClass('flex flex-col gap-3 sm:flex-row sm:items-center')}>
              <span className={twClass('grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700')}>
                <BriefcaseBusiness size={19} />
              </span>
              <div className={twClass('min-w-0 flex-1')}>
                <h2 className={twClass('font-black')}>{j.title}</h2>
                <p className={twClass('text-xs text-slate-500')}>
                  {j.customer?.name || "Customer"} ·{" "}
                  {j.categoryName || "Category"}
                </p>
                <p className={twClass('mt-1 flex flex-wrap gap-3 text-xs text-slate-500')}>
                  <span>
                    <MapPin size={12} className={twClass('mr-1 inline')} />
                    {[j.locality, j.taluka, j.district]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <span>
                    <Users size={12} className={twClass('mr-1 inline')} />
                    {j.workersNeeded || 1}
                  </span>
                </p>
              </div>
              <span className={twClass('rounded-full bg-slate-100 px-3 py-1 text-xs font-black')}>
                {j.status}
              </span>
            </div>
          </article>
        ))}
        {!jobs.length && (
          <div className={twClass('rounded-2xl bg-white p-10 text-center text-sm text-slate-400')}>
            No jobs found.
          </div>
        )}
      </div>
    </div>
  );
}
