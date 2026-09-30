import { twClass } from "../../lib/tw";
import {
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  RefreshCw,
  Star,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingsApi, type CustomerBooking } from "../../lib/api";

/**
 * Booking filters are UI state only. The actual booking records always come
 * from the API, so this page does not contain demo/seed booking records.
 */
type BookingTab = "ongoing" | "completed" | "all";

const ONGOING_STATUSES = new Set(["pending", "confirmed", "ongoing", "active"]);

function isOngoing(status: string) {
  return ONGOING_STATUSES.has(status.toLowerCase());
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function calculateDays(start?: string, end?: string, supplied?: number) {
  if (typeof supplied === "number" && supplied > 0) return supplied;
  if (!start || !end) return null;
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return null;
  return Math.max(1, Math.ceil((to - from) / 86_400_000) + 1);
}

function statusLabel(
  status: string,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const key = `customer.bookings.status.${status.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? status.replace(/[-_]/g, " ") : translated;
}

export default function BookingsPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<BookingTab>("ongoing");

  // React Query owns server state. Components never keep a second copy of API data.
  const query = useQuery({
    queryKey: ["customer", "bookings"],
    queryFn: () => bookingsApi.list(),
    staleTime: 30_000,
  });

  const bookings = query.data?.bookings ?? [];

  const visible = useMemo(() => {
    if (tab === "all") return bookings;
    if (tab === "completed")
      return bookings.filter(
        (booking) => booking.status.toLowerCase() === "completed",
      );
    return bookings.filter((booking) => isOngoing(booking.status));
  }, [bookings, tab]);

  const counts = useMemo(
    () => ({
      ongoing: bookings.filter((booking) => isOngoing(booking.status)).length,
      completed: bookings.filter(
        (booking) => booking.status.toLowerCase() === "completed",
      ).length,
      all: bookings.length,
    }),
    [bookings],
  );

  const refresh = async () => {
    try {
      await query.refetch();
      toast.success(t("customer.bookings.refreshMessage"));
    } catch {
      toast.error(t("customer.bookings.loadError"));
    }
  };

  return (
    <div className={twClass("wf-page")}>
      <div className={twClass("wf-shell")}>
        <div className={twClass("wf-page-title")}>
          <h1>{t("customer.bookings.title")}</h1>
          <p>{t("customer.bookings.subtitle")}</p>
        </div>

        <div className={twClass("wf-bookings-layout")}>
          <section
            className={twClass("wf-panel wf-bookings-panel")}
            aria-label={t("customer.bookings.title")}
          >
            <div className={twClass("wf-results-head wf-bookings-head")}>
              <div
                className={twClass("wf-tabs")}
                role="tablist"
                aria-label={t("customer.bookings.title")}
              >
                {(["ongoing", "completed", "all"] as BookingTab[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={tab === key}
                      className={twClass(
                        `wf-tab ${tab === key ? "active" : ""}`,
                      )}
                      onClick={() => setTab(key)}
                    >
                      <span>{t(`customer.bookings.${key}`)}</span>
                      <span>({counts[key]})</span>
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                className={twClass("wf-outline wf-refresh-button")}
                onClick={refresh}
                disabled={query.isFetching}
              >
                <RefreshCw
                  size={14}
                  className={twClass(query.isFetching ? "animate-spin" : "")}
                />
                <span>{t("customer.bookings.refresh")}</span>
              </button>
            </div>

            {query.isLoading && (
              <div className={twClass("wf-empty")}>
                <Clock3 size={24} />
                <p>{t("customer.bookings.loading")}</p>
              </div>
            )}

            {query.isError && !query.isLoading && (
              <div className={twClass("wf-empty wf-error-state")}>
                <p>{t("customer.bookings.loadError")}</p>
                <button
                  type="button"
                  className={twClass("wf-primary")}
                  onClick={() => void refresh()}
                >
                  {t("customer.bookings.tryAgain")}
                </button>
              </div>
            )}

            {!query.isLoading && !query.isError && !visible.length && (
              <div className={twClass("wf-empty")}>
                <CalendarDays size={28} />
                <p>{t("customer.bookings.empty")}</p>
                <Link className={twClass("wf-primary")} to="/find-workers">
                  {t("customer.bookings.findWorkers")}
                </Link>
              </div>
            )}

            {!query.isLoading && !query.isError && visible.length > 0 && (
              <div className={twClass("wf-bookings")}>
                {visible.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    locale={i18n.language}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>

          <aside
            className={twClass("wf-panel wf-side-card wf-booking-summary")}
          >
            <h3>{t("customer.bookings.summary")}</h3>
            <div className={twClass("wf-side-item")}>
              <b>{counts.ongoing}</b>
              {t("customer.bookings.ongoing")}
            </div>
            <div className={twClass("wf-side-item")}>
              <b>{counts.completed}</b>
              {t("customer.bookings.completed")}
            </div>
            <div className={twClass("wf-side-item")}>
              <b>{counts.all}</b>
              {t("customer.bookings.total")}
            </div>
            <div className={twClass("wf-side-item")}>
              <b>—</b>
              {t("customer.bookings.amountDiscussed")}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  locale,
  t,
}: {
  booking: CustomerBooking;
  locale: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const worker = booking.worker;
  const days = calculateDays(booking.startDate, booking.endDate, booking.days);

  return (
    <article className={twClass("wf-booking")}>
      <img
        className={twClass("wf-row-photo")}
        src={worker?.photo || "/workforce-logo.png"}
        alt={worker?.name || t("customer.bookings.worker")}
      />

      <div className={twClass("wf-booking-main")}>
        <div className={twClass("wf-row-title wf-booking-title")}>
          <b>{worker?.name || t("customer.bookings.worker")}</b>
          {worker?.verified && (
            <span className={twClass("wf-verified")}>
              ✓ {t("customer.findWorkers.verified")}
            </span>
          )}
        </div>

        <div className={twClass("wf-row-sub wf-booking-sub")}>
          {worker?.role && <span>{worker.role}</span>}
          {worker?.place && (
            <>
              <span aria-hidden="true">·</span>
              <MapPin size={12} />
              <span>{worker.place}</span>
            </>
          )}
        </div>

        <div className={twClass("wf-tags wf-booking-tags")}>
          <span className={twClass("wf-tag")}>{booking.id}</span>
          <span className={twClass("wf-tag wf-booking-date")}>
            <CalendarDays size={11} />
            <span>{formatDate(booking.startDate, locale)}</span>
            {booking.endDate && (
              <>
                <span aria-hidden="true">–</span>
                <span>{formatDate(booking.endDate, locale)}</span>
              </>
            )}
          </span>
          {days !== null && (
            <span className={twClass("wf-tag")}>
              {t("customer.bookings.days", { count: days })}
            </span>
          )}
        </div>

        <div className={twClass("wf-rate wf-booking-rating")}>
          <span>{t("customer.bookings.amountDiscussed")}</span>
          {typeof worker?.rating === "number" && (
            <span className={twClass("wf-rating-inline")}>
              <Star size={11} fill="currentColor" /> {worker.rating}
            </span>
          )}
        </div>
      </div>

      <div className={twClass("wf-booking-actions")}>
        <span
          className={twClass(
            `wf-status ${booking.status.toLowerCase() === "completed" ? "completed" : ""}`,
          )}
        >
          {statusLabel(booking.status, t)}
        </span>
        {worker?.id && (
          <Link
            className={twClass("wf-outline wf-icon-action")}
            to={`/messages?worker=${encodeURIComponent(worker.id)}`}
          >
            <MessageCircle size={15} />
            <span>{t("customer.bookings.message")}</span>
          </Link>
        )}
        {worker?.id && (
          <Link
            className={twClass("wf-outline wf-icon-action")}
            to={`/find-workers/${encodeURIComponent(worker.id)}`}
          >
            <UserRound size={15} />
            <span>{t("customer.bookings.viewProfile")}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
