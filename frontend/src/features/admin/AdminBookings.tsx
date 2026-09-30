import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import { CalendarDays, UserRound } from "lucide-react";
import { adminApi } from "../../lib/api";
import { toast } from "sonner";
export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(() => {
    void adminApi
      .bookings()
      .then((r) => setBookings(r.bookings || []))
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Unable to load bookings"),
      );
  }, []);
  return (
    <div className={twClass('space-y-5')}>
      <div>
        <p className={twClass('text-xs font-black uppercase tracking-[.16em] text-emerald-600')}>
          Operations
        </p>
        <h1 className={twClass('text-2xl font-black')}>Bookings</h1>
        <p className={twClass('text-sm text-slate-500')}>
          Live customer-worker booking records.
        </p>
      </div>
      <div className={twClass('grid gap-3')}>
        {bookings.map((b) => (
          <article
            key={b._id}
            className={twClass('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm')}
          >
            <div className={twClass('flex flex-col gap-3 md:flex-row md:items-center')}>
              <span className={twClass('grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700')}>
                <CalendarDays size={19} />
              </span>
              <div className={twClass('min-w-0 flex-1')}>
                <h2 className={twClass('font-black')}>{b.job?.title || "Booking"}</h2>
                <p className={twClass('mt-1 text-xs text-slate-500')}>
                  <UserRound size={12} className={twClass('mr-1 inline')} />
                  {b.customer?.name || "Customer"} →{" "}
                  {b.worker?.name || "Worker"}
                </p>
                <p className={twClass('mt-1 text-xs text-slate-400')}>
                  {b.job?.date ? new Date(b.job.date).toLocaleDateString() : ""}{" "}
                  ·{" "}
                  {[b.job?.taluka, b.job?.district].filter(Boolean).join(", ")}
                </p>
              </div>
              <span className={twClass('rounded-full bg-slate-100 px-3 py-1 text-xs font-black')}>
                {b.status}
              </span>
            </div>
          </article>
        ))}
        {!bookings.length && (
          <div className={twClass('rounded-2xl bg-white p-10 text-center text-sm text-slate-400')}>
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}
