import { twClass } from "../../lib/tw";
import { CheckCircle2, Clock3, MapPin, Save, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../auth/auth.store";
import { fileUrl, workerApi } from "../../lib/api";
import { useWorkerStore } from "./worker.store";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50";

export default function WorkerProfilePage() {
  const { user } = useAuthStore();
  const { profile, availability, setAvailability, verificationStatus, rejectionReason, load } = useWorkerStore();
  const [form, setForm] = useState({ profession: "", bio: "", skills: "", experienceYears: "", district: "", taluka: "", city: "", area: "", languages: "" });
  const [docs, setDocs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      profession: profile.headline || "",
      bio: profile.bio || "",
      skills: (profile.skillNames || []).join(", "),
      experienceYears: String(profile.experienceYears ?? ""),
      district: profile.district || "",
      taluka: profile.taluka || "",
      city: profile.city || "",
      area: profile.area || "",
      languages: (profile.languages || []).join(", "),
    });
  }, [profile]);

  const loadDocuments = async () => {
    try {
      const result = await workerApi.documents();
      setDocs(result.documents || []);
    } catch {
      setDocs([]);
    }
  };

  useEffect(() => { void loadDocuments(); }, [profile?.verificationStatus]);

  const save = async () => {
    setBusy(true);
    try {
      await workerApi.update({
        headline: form.profession,
        bio: form.bio,
        skillNames: form.skills.split(",").map((x) => x.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears) || 0,
        district: form.district,
        taluka: form.taluka,
        city: form.city,
        area: form.area,
        languages: form.languages.split(",").map((x) => x.trim()).filter(Boolean),
      });
      toast.success("Profile saved");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile");
    } finally {
      setBusy(false);
    }
  };

  const verifyLabel = verificationStatus === "verified" ? "Verified" : verificationStatus === "pending" ? "Pending Verification" : "Verification Required";
  const documentLabel = (type: string) => ({ id: "Aadhaar / ID", experience_certificate: "Experience certificate" }[type] || type);

  return (
    <div className={twClass('space-y-5')}>
      <div>
        <p className={twClass('text-xs font-black uppercase tracking-[0.16em] text-emerald-600')}>Worker profile</p>
        <h1 className={twClass('mt-1 text-2xl font-black text-slate-900')}>My Profile</h1>
        <p className={twClass('mt-1 text-sm text-slate-500')}>Manage your professional information, service area and availability.</p>
      </div>

      <div className={twClass('grid gap-5 xl:grid-cols-[300px_1fr]')}>
        <aside className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}>
          <div className={twClass('mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50')}>
            <img src={fileUrl(profile?.profileImage || user?.profileImage) || "/workforce-logo.png"} className={twClass('h-full w-full object-cover')} alt="Worker profile" />
          </div>
          <h2 className={twClass('mt-4 text-center font-black text-slate-900')}>{user?.name || "Worker"}</h2>
          <p className={twClass('mt-1 text-center text-xs text-slate-500')}>{form.profession || "Profession not set"}</p>
          <div className={twClass('mt-4 flex flex-wrap justify-center gap-2')}>
            <span className={twClass('rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700')}>{verifyLabel}</span>
            <span className={twClass('rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600')}>{profile?.experienceYears || 0} years</span>
          </div>
          <div className={twClass('mt-5 border-t border-slate-100 pt-4')}>
            <p className={twClass('text-xs font-bold text-slate-500')}>Availability</p>
            <div className={twClass('mt-2 grid grid-cols-3 gap-1.5')}>
              {(["available", "busy", "unavailable"] as const).map((value) => (
                <button key={value} type="button" onClick={() => void setAvailability(value)} className={availability === value ? "rounded-lg border border-emerald-400 bg-emerald-50 px-2 py-2 text-[10px] font-black text-emerald-700" : "rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-black text-slate-500"}>{value}</button>
              ))}
            </div>
          </div>
        </aside>

        <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6')}>
          <div className={twClass('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')}>
            <div>
              <h2 className={twClass('font-black text-slate-900')}>Professional details</h2>
              <p className={twClass('mt-1 text-xs text-slate-500')}>Your signup selfie remains your permanent profile photo.</p>
            </div>
            <button type="button" onClick={() => void save()} disabled={busy} className={twClass('inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50')}><Save size={15} />{busy ? "Saving…" : "Save"}</button>
          </div>

          <div className={twClass('mt-5 grid gap-4 sm:grid-cols-2')}>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>Profession<input className={inputClass} value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>Experience (years)<input className={inputClass} type="number" min={0} max={70} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600 sm:col-span-2')}>Skills<input className={inputClass} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>District<input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>Taluka / Area<input className={inputClass} value={form.taluka} onChange={(e) => setForm({ ...form, taluka: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>City<input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600')}>Local Area<input className={inputClass} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600 sm:col-span-2')}>Languages<input className={inputClass} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></label>
            <label className={twClass('grid gap-1.5 text-xs font-bold text-slate-600 sm:col-span-2')}>Professional bio<textarea className={twClass('min-h-28 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50')} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
          </div>

          <div className={twClass('mt-5 grid gap-3 sm:grid-cols-3')}>
            <InfoCard icon={<MapPin size={17} className={twClass('text-emerald-600')} />} label="Service area" value={[form.city, form.area].filter(Boolean).join(", ") || "Not set"} />
            <InfoCard icon={<Star size={17} className={twClass('text-amber-500')} />} label="Rating" value={profile?.ratingAverage ? profile.ratingAverage.toFixed(1) : "No ratings"} />
            <InfoCard icon={<CheckCircle2 size={17} className={twClass('text-emerald-600')} />} label="Completed jobs" value={String(profile?.completedJobs || 0)} />
          </div>
        </section>
      </div>

      <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6')}>
        <div className={twClass('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
          <div><h2 className={twClass('font-black text-slate-900')}>Verification documents</h2><p className={twClass('mt-1 text-xs text-slate-500')}>Documents submitted during signup are reviewed by Admin.</p></div>
          <span className={twClass('inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black')}><Clock3 size={13} />{verifyLabel}</span>
        </div>
        {rejectionReason && <div className={twClass('mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700')}><b>Admin reason:</b> {rejectionReason}</div>}
        <div className={twClass('mt-4 divide-y divide-slate-100')}>
          {docs.length ? docs.map((doc) => (
            <div key={doc._id} className={twClass('flex flex-col gap-2 py-3 sm:flex-row sm:items-center')}>
              <span className={"w-fit rounded-full px-2 py-1 text-[9px] font-black " + (doc.status === "approved" ? "bg-emerald-100 text-emerald-700" : doc.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{doc.status}</span>
              <div className={twClass('min-w-0 flex-1')}><b className={twClass('block truncate text-xs')}>{doc.fileName}</b><span className={twClass('text-[10px] text-slate-400')}>{documentLabel(doc.type)}</span></div>
              <span className={twClass('text-[10px] text-slate-400')}>{doc.createdAt ? new Date(doc.createdAt).toLocaleString() : ""}</span>
            </div>
          )) : <p className={twClass('py-5 text-center text-xs text-slate-400')}>No verification documents found.</p>}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className={twClass('rounded-xl bg-slate-50 p-4')}><div>{icon}</div><p className={twClass('mt-2 text-xs font-bold text-slate-500')}>{label}</p><b className={twClass('break-words text-sm text-slate-800')}>{value}</b></div>;
}
