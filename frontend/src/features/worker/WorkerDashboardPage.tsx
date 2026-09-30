import { twClass } from "../../lib/tw";
import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  HelpCircle,
  MapPin,
  MessageCircle,
  UserCircle,
  Settings,
  Heart,
  ShieldCheck,
  ArrowRight,
  Bell,
  Search,
  Star,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useWorkerStore } from "./worker.store";
import { useAuthStore } from "../auth/auth.store";
import { fileUrl } from "../../lib/api";

const quick = [
  [
    "findWork",
    "/worker/find-jobs",
    BriefcaseBusiness,
    "bg-blue-50 text-blue-600",
  ],
  [
    "applications",
    "/worker/applications",
    FileText,
    "bg-violet-50 text-violet-600",
  ],
  [
    "bookings",
    "/worker/bookings",
    CalendarDays,
    "bg-emerald-50 text-emerald-600",
  ],
  ["messages", "/worker/messages", MessageCircle, "bg-cyan-50 text-cyan-600"],
  [
    "notifications",
    "/worker/notifications",
    Bell,
    "bg-amber-50 text-amber-600",
  ],
] as const;

export default function WorkerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    jobs,
    bookings,
    profile,
    loading,
    savedJobs,
    saveJob,
    availability,
    verificationStatus,
  } = useWorkerStore();
  const active = bookings.filter((b) =>
    ["requested", "accepted", "confirmed", "active"].includes(b.status),
  );
  const cards = jobs.filter((j) => j.status !== "expired").slice(0, 5);
  const mobileCards = cards.slice(0, 3);
  const profileImage =
    fileUrl(profile?.profileImage || user?.profileImage) ||
    "/workforce-mark.png";
  const rating = profile?.ratingAverage
    ? profile.ratingAverage.toFixed(1)
    : "—";
  const completed = profile?.completedJobs ?? 0;
  const isVerified = verificationStatus === "verified";
  const availabilityLabel = t(
    `worker.dashboard.availability.${availability}`,
    availability,
  );

  return (
    <div className={twClass("bg-[#f5faff] pb-8")}>
      {/* Desktop/tablet flow kept intact. */}
      <div className={twClass("hidden md:block")}>
        <section className={twClass("wf-worker-reference-hero")}>
          <div className={twClass("wf-wide wf-worker-reference-hero-inner")}>
            <div className={twClass("wf-worker-reference-copy")}>
              <h1>
                {t("worker.dashboard.desktopHeroTitle1")}{" "}
                <span>{t("worker.dashboard.desktopHeroTitle2")}</span>{" "}
                {t("worker.dashboard.desktopHeroWith")}
              </h1>
              <p>{t("worker.dashboard.desktopHeroDesc")}</p>
              <Link
                to="/worker/find-jobs"
                className={twClass("wf-worker-reference-search")}
              >
                <BriefcaseBusiness size={16} /> {t("worker.dashboard.findJobs")}
              </Link>
            </div>
            <img
              src="/workforce-hero-clean.jpg"
              alt="WORKFORCE opportunities"
            />
          </div>
        </section>
        <section className={twClass("wf-wide wf-worker-quick")}>
          <div className={twClass("wf-worker-section-head")}>
            <div>
              <h2>{t("worker.dashboard.quickAccess")}</h2>
              <p>{t("worker.dashboard.quickDesc")}</p>
            </div>
            <Link to="/worker/find-jobs">
              {t("worker.dashboard.viewCategories")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className={twClass("wf-worker-quick-grid")}>
            {[
              [
                t("worker.dashboard.findJobs"),
                "/worker/find-jobs",
                BriefcaseBusiness,
                "bg-blue-50 text-blue-600",
              ],
              [
                t("worker.dashboard.myBookings"),
                "/worker/bookings",
                CalendarDays,
                "bg-emerald-50 text-emerald-600",
              ],
              [
                t("worker.dashboard.applications"),
                "/worker/applications",
                FileText,
                "bg-violet-50 text-violet-600",
              ],
              [
                t("worker.dashboard.messages"),
                "/worker/messages",
                MessageCircle,
                "bg-amber-50 text-amber-600",
              ],
              [
                t("worker.dashboard.workguide"),
                "/worker/workguide",
                GraduationCap,
                "bg-cyan-50 text-cyan-600",
              ],
              [
                t("worker.dashboard.profile"),
                "/worker/profile",
                UserCircle,
                "bg-pink-50 text-pink-600",
              ],
              [
                t("worker.dashboard.helpSupport"),
                "/worker/workguide",
                HelpCircle,
                "bg-indigo-50 text-indigo-600",
              ],
              [
                t("worker.dashboard.settings"),
                "/worker/profile",
                Settings,
                "bg-slate-100 text-slate-600",
              ],
            ].map(([label, to, Icon, cls]) => (
              <Link
                key={String(label)}
                to={String(to)}
                className={twClass("wf-worker-quick-card")}
              >
                <span
                  className={twClass(`wf-worker-quick-icon ${String(cls)}`)}
                >
                  <Icon size={24} />
                </span>
                <b>{String(label)}</b>
              </Link>
            ))}
          </div>
        </section>
        <section className={twClass("wf-wide wf-worker-jobs-section")}>
          <div className={twClass("wf-worker-section-head")}>
            <div>
              <h2>{t("worker.dashboard.recommendedJobs")}</h2>
              <p>{t("worker.dashboard.recommendedDesc")}</p>
            </div>
            <Link to="/worker/find-jobs">
              {t("worker.dashboard.viewAllJobs")} <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className={twClass("wf-empty")}>
              {t("worker.dashboard.loadingJobs")}
            </div>
          ) : !cards.length ? (
            <div className={twClass("wf-empty")}>
              {t("worker.dashboard.noJobs")}
            </div>
          ) : (
            <div className={twClass("wf-worker-job-cards")}>
              {cards.map((job, i) => (
                <article className={twClass("wf-worker-job-card")} key={job.id}>
                  <div className={twClass("wf-worker-job-media")}>
                    <img
                      src={
                        job.imageUrl ||
                        `/worker-${["carpenter", "electrician", "plumber", "chef", "cleaning"][i % 5]}.jpg`
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/worker-carpenter.jpg";
                      }}
                      alt={t("worker.dashboard.workRequirement")}
                    />
                    <span>
                      <ShieldCheck size={11} /> {t("worker.dashboard.verified")}
                    </span>
                    <button
                      type="button"
                      aria-label={t("worker.dashboard.saveJob")}
                      onClick={() => saveJob(job.id)}
                      className={twClass(
                        savedJobs.includes(job.id) ? "is-saved" : "",
                      )}
                    >
                      <Heart
                        size={15}
                        fill={
                          savedJobs.includes(job.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>
                  <div className={twClass("wf-worker-job-body")}>
                    <h3>{job.title}</h3>
                    <p>
                      <BriefcaseBusiness size={12} />{" "}
                      {job.customer || t("worker.dashboard.customer")}
                    </p>
                    <p>
                      <MapPin size={12} />{" "}
                      {job.location || t("worker.dashboard.locationMissing")}
                    </p>
                    <p>
                      <CalendarDays size={12} />{" "}
                      {job.date || t("worker.dashboard.dateMissing")}
                    </p>
                    <p>
                      <span className={twClass("wf-negotiated")}>
                        {t("worker.dashboard.amountInMessages")}
                      </span>
                    </p>
                    <div className={twClass("wf-worker-job-foot")}>
                      <span>
                        {job.workersNeeded || 1}{" "}
                        {t("worker.dashboard.workersNeeded")}
                      </span>
                      <span className={twClass("wf-verified-mini")}>
                        {t("worker.dashboard.verified")}
                      </span>
                    </div>
                    <Link to={`/worker/find-jobs?job=${job.id}`}>
                      {t("worker.dashboard.viewJob")} <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className={twClass("wf-wide wf-worker-trust")}>
          <div>
            <b>{t("worker.dashboard.workerTitle")}</b>
            <span>{t("worker.dashboard.workerSub")}</span>
          </div>
          <div>
            <b>{active.length}</b>
            <small>{t("worker.dashboard.activeBookings")}</small>
          </div>
          <div>
            <b>{completed}</b>
            <small>{t("worker.dashboard.completedJobs")}</small>
          </div>
          <div>
            <b>{rating}</b>
            <small>{t("worker.dashboard.userRating")}</small>
          </div>
        </section>
      </div>

      {/* Mobile reference flow — matches the supplied Worker mobile UI. */}
      <div className={twClass("md:hidden")}>
        <section className={twClass("px-4 pb-3 pt-4")}>
          <div className={twClass("flex items-start justify-between gap-3")}>
            <div className={twClass("min-w-0")}>
              <p className={twClass("text-sm font-semibold text-slate-700")}>
                {t("worker.dashboard.hello")},
              </p>
              <h1
                className={twClass(
                  "truncate text-[22px] font-black leading-tight text-[#083968]",
                )}
              >
                {user?.name || t("worker.dashboard.worker")}
              </h1>
              <div
                className={twClass(
                  "mt-1 flex flex-wrap items-center gap-2 text-xs",
                )}
              >
                <span
                  className={twClass(
                    "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-black text-emerald-700",
                  )}
                >
                  <span
                    className={twClass("h-2 w-2 rounded-full bg-emerald-500")}
                  />
                  {availabilityLabel}
                </span>
                <span
                  className={twClass(
                    "inline-flex items-center gap-1 font-bold text-[#17496e]",
                  )}
                >
                  <ShieldCheck size={14} />
                  {isVerified
                    ? t("worker.dashboard.verifiedWorker")
                    : t("worker.dashboard.verificationPending")}
                </span>
              </div>
            </div>
            <img
              src={profileImage}
              onError={(e) => {
                e.currentTarget.src = "/workforce-mark.png";
              }}
              alt={t("worker.dashboard.profilePhoto")}
              className={twClass(
                "h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-md",
              )}
            />
          </div>
          <div
            className={twClass(
              "mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
            )}
          >
            <div
              className={twClass(
                "flex items-center justify-center gap-2 border-r border-slate-200 p-3",
              )}
            >
              <Star
                size={20}
                fill="currentColor"
                className={twClass("text-amber-400")}
              />
              <div>
                <b
                  className={twClass("block text-lg font-black text-[#083968]")}
                >
                  {rating}
                </b>
                <small className={twClass("text-[10px] text-slate-500")}>
                  {profile?.ratingCount ?? 0} {t("worker.dashboard.reviews")}
                </small>
              </div>
            </div>
            <div
              className={twClass("flex items-center justify-center gap-2 p-3")}
            >
              <BriefcaseBusiness
                size={20}
                className={twClass("text-[#083968]")}
              />
              <div>
                <b
                  className={twClass("block text-lg font-black text-[#083968]")}
                >
                  {completed}
                </b>
                <small className={twClass("text-[10px] text-slate-500")}>
                  {t("worker.dashboard.completedJobs")}
                </small>
              </div>
            </div>
          </div>
        </section>

        <section
          className={twClass(
            "mx-4 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm",
          )}
        >
          <div className={twClass("relative min-h-[205px] overflow-hidden")}>
            <img
              src="/workforce-hero-clean.jpg"
              alt="WORKFORCE"
              className={twClass("absolute inset-0 h-full w-full object-cover")}
            />
            <div
              className={twClass(
                "absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10",
              )}
            />
            <div className={twClass("relative z-10 max-w-[58%] p-5")}>
              <p className={twClass("text-xs font-semibold text-[#17507b]")}>
                {t("worker.dashboard.skillsFuture")}
              </p>
              <h2
                className={twClass(
                  "mt-1 text-[25px] font-black leading-[1.05] text-[#083968]",
                )}
              >
                {t("worker.dashboard.findBetter")}
                <br />
                <span className={twClass("text-emerald-600")}>
                  {t("worker.dashboard.workOpportunities")}
                </span>
              </h2>
              <p
                className={twClass("mt-2 text-[11px] leading-4 text-[#204e75]")}
              >
                {t("worker.dashboard.growCareer")}
              </p>
              <Link
                to="/worker/find-jobs"
                className={twClass(
                  "mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm",
                )}
              >
                <Search size={16} />
                {t("worker.dashboard.findWork")}
              </Link>
            </div>
          </div>
        </section>

        <section className={twClass("px-4 pt-4")}>
          <div className={twClass("grid grid-cols-5 gap-2")}>
            {quick.map(([key, to, Icon, cls]) => (
              <Link
                key={key}
                to={to}
                className={twClass(
                  "min-w-0 rounded-2xl border border-slate-100 bg-white p-2 text-center shadow-sm",
                )}
              >
                <span
                  className={twClass(
                    `mx-auto grid h-11 w-11 place-items-center rounded-full ${cls}`,
                  )}
                >
                  <Icon size={22} />
                </span>
                <b
                  className={twClass(
                    "mt-2 block text-[9px] font-black leading-3 text-[#123f67]",
                  )}
                >
                  {t(`worker.dashboard.quick.${key}`)}
                </b>
                <small
                  className={twClass(
                    "mt-1 block text-[8px] leading-3 text-slate-500",
                  )}
                >
                  {t(`worker.dashboard.quickSub.${key}`)}
                </small>
              </Link>
            ))}
          </div>
        </section>

        <section className={twClass("px-4 pt-5")}>
          <div className={twClass("mb-3 flex items-end justify-between gap-2")}>
            <div>
              <h2 className={twClass("text-[20px] font-black text-[#083968]")}>
                {t("worker.dashboard.availableJobs")}
              </h2>
              <p className={twClass("mt-0.5 text-[11px] text-slate-500")}>
                {t("worker.dashboard.availableJobsSub")}
              </p>
            </div>
            <Link
              to="/worker/find-jobs"
              className={twClass("text-xs font-black text-emerald-600")}
            >
              {t("worker.dashboard.viewAll")}{" "}
              <ChevronRight size={14} className={twClass("inline")} />
            </Link>
          </div>
          {loading ? (
            <div
              className={twClass(
                "rounded-2xl bg-white p-8 text-center text-sm text-slate-400",
              )}
            >
              {t("worker.dashboard.loadingJobs")}
            </div>
          ) : !mobileCards.length ? (
            <div
              className={twClass(
                "rounded-2xl bg-white p-8 text-center text-sm text-slate-400",
              )}
            >
              {t("worker.dashboard.noJobs")}
            </div>
          ) : (
            <div className={twClass("grid gap-3")}>
              {mobileCards.map((job, i) => (
                <article
                  key={job.id}
                  className={twClass(
                    "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
                  )}
                >
                  <div className={twClass("flex gap-3 p-3")}>
                    <img
                      src={
                        job.imageUrl ||
                        `/worker-${["carpenter", "cleaning", "electrician"][i % 3]}.jpg`
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/worker-carpenter.jpg";
                      }}
                      alt={t("worker.dashboard.workRequirement")}
                      className={twClass(
                        "h-20 w-20 shrink-0 rounded-xl object-cover",
                      )}
                    />
                    <div className={twClass("min-w-0 flex-1")}>
                      <div
                        className={twClass(
                          "flex items-start justify-between gap-2",
                        )}
                      >
                        <h3
                          className={twClass(
                            "text-sm font-black leading-5 text-[#123f67]",
                          )}
                        >
                          {job.title}
                        </h3>
                        <span
                          className={twClass(
                            "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black text-emerald-700",
                          )}
                        >
                          {t("worker.dashboard.new")}
                        </span>
                      </div>
                      <p
                        className={twClass(
                          "mt-1 flex items-center gap-1 text-[10px] text-slate-500",
                        )}
                      >
                        <MapPin size={12} />
                        {job.location || t("worker.dashboard.locationMissing")}
                      </p>
                      <div className={twClass("mt-2 flex flex-wrap gap-1.5")}>
                        {job.skills.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className={twClass(
                              "rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-700",
                            )}
                          >
                            {s}
                          </span>
                        ))}
                        <span
                          className={twClass(
                            "rounded-full bg-violet-50 px-2 py-1 text-[8px] font-bold text-violet-700",
                          )}
                        >
                          {job.date || t("worker.dashboard.dateMissing")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={twClass(
                      "flex items-center justify-end border-t border-slate-100 px-3 py-2.5",
                    )}
                  >
                    <Link
                      to={`/worker/find-jobs?job=${job.id}`}
                      className={twClass(
                        "inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white",
                      )}
                    >
                      {t("worker.dashboard.applyNow")} <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className={twClass(
            "mx-4 mt-5 mb-20 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4",
          )}
        >
          <div className={twClass("flex min-w-0 items-center gap-3")}>
            <span
              className={twClass(
                "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-white",
              )}
            >
              <ShieldCheck size={24} />
            </span>
            <div className={twClass("min-w-0")}>
              <b className={twClass("block text-sm font-black text-[#123f67]")}>
                {t("worker.dashboard.verificationStatus")}
              </b>
              <p
                className={twClass("mt-1 text-[10px] leading-4 text-slate-600")}
              >
                {isVerified
                  ? t("worker.dashboard.verifiedMessage")
                  : t("worker.dashboard.pendingMessage")}
              </p>
            </div>
          </div>
          <Link
            to="/worker/profile"
            className={twClass(
              "shrink-0 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[10px] font-black text-emerald-700",
            )}
          >
            {t("worker.dashboard.viewDocuments")}
          </Link>
        </section>
      </div>
    </div>
  );
}
