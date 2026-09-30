import { twClass } from "../../lib/tw";
import { CalendarDays, MapPin, MessageCircle, UserRound, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useWorkerStore } from "./worker.store";
import { fileUrl } from "../../lib/api";

/** Server-backed booking cards. Chat becomes available as soon as the booking is accepted/confirmed. */
export default function WorkerBookingsPage() {
  const { bookings } = useWorkerStore();
  return <div className={twClass('space-y-5')}>
    <div><h1 className={twClass('text-2xl font-black')}>My Bookings</h1><p className={twClass('mt-1 text-sm text-slate-500')}>Manage your live customer bookings.</p></div>
    <div className={twClass('grid gap-4')}>
      {bookings.map((booking) => {
        const canMessage = Boolean(booking.customerId) && ["accepted", "confirmed", "active", "completed"].includes(booking.status);
        return <article key={booking.id} className={twClass('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm')}>
          <div className={twClass('flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3')}><span className={twClass('inline-flex items-center gap-2 text-xs font-black text-slate-700')}><CalendarDays size={15} className={twClass('text-emerald-600')}/> {booking.date || "Date to be confirmed"}</span><span className={twClass('rounded-full bg-white px-3 py-1 text-[10px] font-black capitalize text-slate-700 shadow-sm')}>{booking.status}</span></div>
          <div className={twClass('p-4 sm:p-5')}><div className={twClass('flex flex-col gap-4 sm:flex-row sm:items-start')}>
            <img src={fileUrl(booking.customerImage)||"/workforce-logo.png"} onError={(e)=>{e.currentTarget.src="/workforce-logo.png"}} className={twClass('h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover')} alt={booking.customer||"Customer"}/>
            <div className={twClass('min-w-0 flex-1')}><h2 className={twClass('text-base font-black text-slate-900')}>{booking.title}</h2><p className={twClass('mt-1 text-xs font-semibold text-slate-600')}>Customer: {booking.customer}</p><p className={twClass('mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500')}><MapPin size={12}/> {booking.location || "Location not provided"} {booking.duration && `· ${booking.duration}`}</p><p className={twClass('mt-2 text-xs text-slate-500')}>Final amount is discussed with the customer in Messages.</p></div>
          </div>
            <div className={twClass('mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4')}><Link to={`/worker/bookings/${booking.id}`} className={twClass('inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white')}>View booking <ArrowRight size={13}/></Link>{canMessage&&<Link to={`/worker/messages?worker=${encodeURIComponent(booking.customerId!)}`} className={twClass('inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-black text-emerald-700')}><MessageCircle size={13}/> Message customer</Link>}{booking.customerId&&<Link to={`/worker/messages?worker=${encodeURIComponent(booking.customerId)}`} className={twClass('inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-600')}><UserRound size={13}/> Chat</Link>}</div>
          </div>
        </article>;
      })}
      {!bookings.length&&<div className={twClass('rounded-2xl bg-white p-10 text-center text-sm text-slate-400')}>No bookings yet.</div>}
    </div>
  </div>;
}
