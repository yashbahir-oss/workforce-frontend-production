import { twClass } from "../../lib/tw";
import { Camera, CheckCircle2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useWorkerStore } from "./worker.store";
import WorkerSelfieCamera from "../auth/WorkerSelfieCamera";

export default function WorkerBookingDetailsPage() {
  const { id } = useParams();
  const { bookings, startBooking, completeBooking, confirmCompletion } = useWorkerStore();
  const booking = bookings.find((item) => item.id === id);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);

  if (!booking) return <div className={twClass('rounded-2xl bg-white p-10 text-center text-sm text-slate-400')}>Booking not found.</div>;

  const canStart = ["requested", "accepted", "confirmed"].includes(booking.status) && Boolean(selfie);
  const canMessage = ["accepted", "confirmed", "active", "completed"].includes(booking.status) && Boolean(booking.customerId);

  return <div className={twClass('space-y-5')}>
    <div className={twClass('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between')}><div><h1 className={twClass('text-2xl font-black')}>{booking.title}</h1><p className={twClass('mt-1 text-sm text-slate-500')}>Booking {booking.id} · {booking.customer}</p></div>{canMessage && <Link to={`/worker/messages?worker=${encodeURIComponent(booking.customerId!)}`} className={twClass('inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white')}><MessageCircle size={15}/> Message customer</Link>}</div>
    <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6')}>
      <div className={twClass('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between')}><div><h2 className={twClass('font-black')}>Work details</h2><p className={twClass('mt-2 text-sm text-slate-600')}><MapPin size={14} className={twClass('mr-1 inline text-emerald-600')}/>{booking.location || "Location not provided"}</p><p className={twClass('mt-1 text-xs text-slate-400')}>{booking.date} {booking.duration && `· ${booking.duration}`}</p></div><span className={twClass('rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize')}>{booking.status}</span></div>
      <div className={twClass('mt-6 rounded-2xl bg-slate-50 p-4')}><h3 className={twClass('font-bold')}>Communication & amount</h3><p className={twClass('mt-1 text-xs leading-5 text-slate-500')}>Discuss the final amount and work scope with the customer through Messages. WORKFORCE does not invent a fixed worker rate.</p>{canMessage&&<Link to={`/worker/messages?worker=${encodeURIComponent(booking.customerId!)}`} className={twClass('mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700')}><MessageCircle size={13}/> Open booking chat</Link>}</div>
    </section>

    {["requested", "accepted", "confirmed"].includes(booking.status) && <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}><h2 className={twClass('flex items-center gap-2 font-black')}><Camera size={18}/> Arrival verification</h2><p className={twClass('mt-1 text-xs leading-5 text-slate-500')}>Take a fresh selfie with the camera before starting work. Gallery/file upload is disabled.</p><div className={twClass('mt-4 flex flex-wrap items-center gap-2')}><button type="button" onClick={()=>setCameraOpen(true)} className={twClass('inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black')}><Camera size={15}/> {selfie ? "Retake selfie" : "Open camera"}</button>{selfie&&<span className={twClass('inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700')}><CheckCircle2 size={15}/> Selfie ready</span>}</div><button disabled={!canStart} onClick={()=>void startBooking(booking.id,selfie!)} className={twClass('mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-40')}><ShieldCheck size={16}/> Start work</button></section>}
    {booking.status === "active" && <section className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}><h2 className={twClass('font-black')}>Work in progress</h2><p className={twClass('mt-1 text-xs text-slate-500')}>Mark the booking completed when the work is finished.</p><button onClick={()=>void completeBooking(booking.id)} className={twClass('mt-4 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white')}>Mark completed</button></section>}
    {booking.status === "completed" && <section className={twClass('rounded-2xl border border-emerald-200 bg-emerald-50 p-5')}><h2 className={twClass('font-black text-emerald-900')}>Work completed</h2><p className={twClass('mt-1 text-xs text-emerald-800')}>The customer should confirm completion. Your own completion action remains available for the existing workflow.</p><button onClick={()=>void confirmCompletion(booking.id)} className={twClass('mt-4 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white')}>Confirm completion</button></section>}
    <WorkerSelfieCamera open={cameraOpen} onClose={()=>setCameraOpen(false)} onCapture={(file)=>{setSelfie(file);setCameraOpen(false)}} />
  </div>;
}
