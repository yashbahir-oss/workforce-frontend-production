import { twClass } from "../../lib/tw";
import {
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  ChefHat,
  Grid2X2,
  GraduationCap,
  HardHat,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useEffect, useState } from "react";
import { useAuthStore } from "../auth/auth.store";
import { toast } from "sonner";
import {
  catalogApi,
  fileUrl,
  type Category,
  type PublicWorker,
  workersApi,
} from "../../lib/api";

const categoryIcons = [
  ChefHat,
  HardHat,
  Wrench,
  Grid2X2,
  GraduationCap,
  CarFront,
  Users,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
];
const categoryImages = [
  "/worker-chef.jpg",
  "/worker-carpenter.jpg",
  "/worker-electrician.jpg",
  "/worker-plumber.jpg",
  "/worker-cleaning.jpg",
  "/worker-decorator.jpg",
];

export default function CustomerHomePage() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<PublicWorker[]>([]);
  const [stats, setStats] = useState({
    workers: 0,
    completedJobs: 0,
    averageRating: 0,
    reviews: 0,
  });
  const [districts, setDistricts] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  useEffect(() => {
    Promise.all([
      catalogApi.categories(),
      catalogApi.locations(),
      catalogApi.stats(),
    ])
      .then(([c, l, s]) => {
        setCategories(c.categories || []);
        setDistricts(l.districts || []);
        setStats(s);
      })
      .catch(() => undefined);
    workersApi
      .search({ limit: 6 })
      .then((r) => setWorkers(r.workers || []))
      .catch(() => setWorkers([]));
    if (token)
      workersApi
        .favorites()
        .then((r) => setFavorites(new Set(r.workerIds || [])))
        .catch(() => undefined);
  }, [token]);
  const toggleFavorite = async (id: string) => {
    if (!token) {
      toast.info(t("auth.loginRequired", "Please login to save workers"));
      return;
    }
    try {
      const r = await workersApi.toggleFavorite(id);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (r.favorite) next.add(id);
        else next.delete(id);
        return next;
      });
      toast.success(
        r.favorite
          ? t("customer.hero.favoriteAdded")
          : t("customer.hero.favoriteRemoved"),
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("customer.hero.favoriteFailed"),
      );
    }
  };
  const selected = categories.find(
    (c) =>
      c._id === category ||
      c.name.toLowerCase() === category.trim().toLowerCase() ||
      (c.slug || "").toLowerCase() === category.trim().toLowerCase(),
  );
  const params = new URLSearchParams();
  if (selected) params.set("category", selected._id);
  else if (category.trim()) params.set("q", category.trim());
  if (location.trim()) params.set("location", location.trim());
  const mobileSearchParams = new URLSearchParams();
  if (category.trim()) mobileSearchParams.set("q", category.trim());
  if (location.trim()) mobileSearchParams.set("location", location.trim());
  const workerCard = (w: PublicWorker, i: number) => (
    <article
      key={w.id}
      className={twClass(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
      )}
    >
      <div className={twClass("relative h-40 overflow-hidden bg-slate-100")}>
        <img
          src={
            fileUrl(w.profileImage) || categoryImages[i % categoryImages.length]
          }
          onError={(e) => {
            e.currentTarget.src = categoryImages[i % categoryImages.length];
          }}
          alt={w.name}
          loading="lazy"
          className={twClass("h-full w-full object-cover")}
        />
        <button
          type="button"
          aria-label={t("customer.mobile.profile")}
          aria-pressed={favorites.has(w.id)}
          onClick={() => void toggleFavorite(w.id)}
          className={twClass(
            `absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow ${favorites.has(w.id) ? "text-rose-600" : "text-slate-500"}`,
          )}
        >
          <Heart
            size={17}
            fill={favorites.has(w.id) ? "currentColor" : "none"}
          />
        </button>
        <span
          className={twClass(
            "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-black text-white",
          )}
        >
          <ShieldCheck size={11} />
          {t("customer.mobile.verified")}
        </span>
      </div>
      <div className={twClass("p-3")}>
        <h3 className={twClass("text-base font-black text-[#083968]")}>
          {w.name}
        </h3>
        <p className={twClass("mt-0.5 text-xs font-bold text-[#28557a]")}>
          {w.profession || w.headline || t("customer.profilePage.professional")}
        </p>
        <p
          className={twClass(
            "mt-2 flex items-center gap-1 text-xs text-slate-500",
          )}
        >
          <Star
            size={13}
            fill="currentColor"
            className={twClass("text-amber-400")}
          />{" "}
          {w.rating ? w.rating.toFixed(1) : "—"}{" "}
          <span>
            ({w.ratingCount || 0} {t("customer.mobile.reviews")})
          </span>
        </p>
        <p
          className={twClass(
            "mt-1 flex items-center gap-1 text-xs text-slate-500",
          )}
        >
          <MapPin size={13} />{" "}
          {[w.locality, w.district].filter(Boolean).join(", ") || "—"}
        </p>
        <p className={twClass("mt-1 text-xs font-bold text-emerald-700")}>
          {w.experienceYears ?? "—"} {t("customer.profilePage.yearsExperience")}
        </p>
        <Link
          to={`/find-workers/${w.id}`}
          className={twClass(
            "mt-3 flex min-h-10 items-center justify-center gap-1 rounded-xl bg-emerald-600 text-xs font-black text-white",
          )}
        >
          {t("customer.mobile.profile")} <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
  return (
    <div className={twClass("wf-home")}>
      {/* Desktop/tablet flow. */}
      <div className={twClass("hidden md:block")}>
        <section className={twClass("wf-hero max-[620px]:!min-h-0")}>
          <div
            className={twClass(
              "wf-wide wf-hero-inner max-[620px]:!min-h-0 max-[620px]:!flex-col max-[620px]:!items-stretch",
            )}
          >
            <div
              className={twClass(
                "wf-hero-copy max-[620px]:!order-2 max-[620px]:!w-full max-[620px]:!px-0 max-[620px]:!py-5",
              )}
            >
              <span className={twClass("wf-kicker")}>
                <ShieldCheck size={14} />
                {t("customer.hero.kicker")}
              </span>
              <h1>
                {t("customer.hero.title")}
                <br />
                <em>{t("customer.hero.title2")}</em>
              </h1>
              <p>{t("customer.hero.description")}</p>
              <div className={twClass("wf-hero-search")}>
                <label>
                  <BriefcaseBusiness size={17} />
                  <input
                    list="home-categories"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t("customer.hero.category")}
                  />
                </label>
                <label>
                  <MapPin size={17} />
                  <input
                    list="home-locations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("customer.hero.location")}
                  />
                </label>
                <Link
                  to={`/find-workers?${params}`}
                  className={twClass("wf-primary")}
                >
                  <Search size={17} />
                  {t("customer.hero.search")}
                </Link>
              </div>
              <div className={twClass("wf-hero-benefits")}>
                <span>
                  <ShieldCheck /> <b>{t("customer.hero.benefits.verified")}</b>
                  <small>{t("customer.hero.benefits.verifiedSub")}</small>
                </span>
                <span>
                  <Sparkles /> <b>{t("customer.hero.benefits.secure")}</b>
                  <small>{t("customer.hero.benefits.secureSub")}</small>
                </span>
                <span>
                  <Users /> <b>{t("customer.hero.benefits.support")}</b>
                  <small>{t("customer.hero.benefits.supportSub")}</small>
                </span>
                <span>
                  <Star /> <b>{t("customer.hero.benefits.categories")}</b>
                  <small>{t("customer.hero.benefits.categoriesSub")}</small>
                </span>
              </div>
              <datalist id="home-categories">
                {categories.map((c) => (
                  <option key={c._id} value={c.name} />
                ))}
              </datalist>
              <datalist id="home-locations">
                {districts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div
              className={twClass(
                "wf-hero-people max-[620px]:!order-1 max-[620px]:!relative max-[620px]:!right-auto max-[620px]:!top-auto max-[620px]:!h-[220px] max-[620px]:!w-full",
              )}
              aria-hidden="true"
            >
              <img src="/workforce-hero-clean.jpg" alt="" />
            </div>
          </div>
        </section>
        <section className={twClass("wf-wide wf-card-section")}>
          <div className={twClass("wf-section-title")}>
            <div>
              <h2>{t("customer.hero.popularTitle")}</h2>
              <p>{t("customer.hero.popularDesc")}</p>
            </div>
            <Link to="/find-workers" className={twClass("wf-green-link")}>
              {t("customer.hero.viewCategories")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className={twClass("wf-category-grid")}>
            {categories.slice(0, 10).map((c, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
                <Link
                  key={c._id}
                  to={`/find-workers?category=${encodeURIComponent(c._id)}`}
                  className={twClass("wf-category-card")}
                >
                  <span className={twClass(`wf-cat-icon c${i % 6}`)}>
                    <Icon size={24} />
                  </span>
                  <b>{c.name}</b>
                </Link>
              );
            })}
            <Link to="/find-workers" className={twClass("wf-category-card")}>
              <span className={twClass("wf-cat-icon c5")}>
                <Grid2X2 size={23} />
              </span>
              <b>{t("customer.hero.viewAll")}</b>
            </Link>
          </div>
        </section>
        <section className={twClass("wf-wide wf-trust-strip")}>
          <div className={twClass("wf-trust-lead")}>
            <span className={twClass("wf-leaf")}>✦</span>
            <div>
              <b>{t("customer.hero.trusted")}</b>
              <small>{t("customer.hero.trustedSub")}</small>
            </div>
          </div>
          <div>
            <Users />
            <b>{stats.workers || "—"}+</b>
            <small>{t("customer.hero.verifiedWorkers")}</small>
          </div>
          <div>
            <BriefcaseBusiness />
            <b>{stats.completedJobs || "—"}+</b>
            <small>{t("customer.hero.jobsCompleted")}</small>
          </div>
          <div>
            <Star />
            <b>
              {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}/5
            </b>
            <small>{t("customer.hero.userRating")}</small>
          </div>
        </section>
        <section className={twClass("wf-wide wf-card-section")}>
          <div className={twClass("wf-section-title")}>
            <div>
              <h2>
                {t("customer.hero.workersTitle", "Popular Workers Near You")}
              </h2>
              <p>
                {t(
                  "customer.hero.workersDesc",
                  "Top rated and verified professionals in your area.",
                )}
              </p>
            </div>
            <Link to="/find-workers" className={twClass("wf-green-link")}>
              {t("customer.hero.viewWorkers", "View All Workers")}{" "}
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className={twClass("wf-worker-grid max-[620px]:!grid-cols-1")}>
            {workers.map((w, i) => (
              <article key={w.id} className={twClass("wf-worker-card")}>
                <div className={twClass("wf-worker-media")}>
                  <img
                    src={
                      fileUrl(w.profileImage) ||
                      categoryImages[i % categoryImages.length]
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        categoryImages[i % categoryImages.length];
                    }}
                    alt={w.name}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    aria-label={t("customer.mobile.profile")}
                    aria-pressed={favorites.has(w.id)}
                    onClick={() => void toggleFavorite(w.id)}
                    className={twClass(
                      `wf-worker-like ${favorites.has(w.id) ? "is-liked" : ""}`,
                    )}
                  >
                    <Heart
                      size={16}
                      fill={favorites.has(w.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <span className={twClass("wf-verified")}>
                    <ShieldCheck size={11} />{" "}
                    {t("customer.findWorkers.verified")}
                  </span>
                </div>
                <div className={twClass("wf-worker-info")}>
                  <h3>{w.name}</h3>
                  <p className={twClass("wf-worker-prof")}>
                    {w.profession ||
                      w.headline ||
                      t("customer.profilePage.professional")}
                  </p>
                  <p>
                    <Star
                      size={13}
                      fill="currentColor"
                      className={twClass("text-amber-500")}
                    />{" "}
                    {w.rating ? w.rating.toFixed(1) : "—"}{" "}
                    <span>
                      ({w.ratingCount || 0}{" "}
                      {t("customer.profilePage.reviewsShort")})
                    </span>
                  </p>
                  <p>
                    <MapPin size={13} />{" "}
                    {[w.locality, w.district].filter(Boolean).join(", ") || "—"}
                  </p>
                  <p className={twClass("wf-worker-exp")}>
                    {w.experienceYears ?? "—"}{" "}
                    {t("customer.profilePage.yearsExperience")}
                  </p>
                  <div className={twClass("wf-worker-actions")}>
                    <Link to={`/find-workers/${w.id}`}>
                      {t("customer.findWorkers.viewProfile")}{" "}
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to={`/post-requirement?worker=${w.id}`}
                      className={twClass("secondary")}
                    >
                      {t("customer.findWorkers.postRequirement")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!workers.length && (
            <div className={twClass("wf-empty")}>
              {t("customer.hero.noWorkers")}
            </div>
          )}
        </section>
      </div>

      {/* Mobile flow — matches the supplied customer mobile reference and keeps workers one-per-row. */}
      <div className={twClass("md:hidden")}>
        <section className={twClass("px-4 pt-3")}>
          <div
            className={twClass(
              "relative min-h-[230px] overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 shadow-sm",
            )}
          >
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
            <div className={twClass("relative z-10 max-w-[70%] p-5")}>
              <h1
                className={twClass(
                  "text-[27px] font-black leading-[1.05] tracking-tight text-[#083968]",
                )}
              >
                {t("customer.hero.title")}
                <br />
                <span className={twClass("text-emerald-600")}>
                  {t("customer.hero.title2")}
                </span>
              </h1>
              <p
                className={twClass("mt-3 text-[11px] leading-4 text-[#204e75]")}
              >
                {t("customer.hero.description")}
              </p>
            </div>
          </div>
          <div
            className={twClass(
              "relative z-20 -mt-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg",
            )}
          >
            <div className={twClass("grid grid-cols-[1fr_1fr] gap-2")}>
              <label
                className={twClass(
                  "flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-500",
                )}
              >
                <BriefcaseBusiness size={16} />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("customer.mobile.searchPlaceholder")}
                  className={twClass(
                    "min-w-0 w-full border-0 bg-transparent text-[10px] text-slate-700 outline-none",
                  )}
                />
              </label>
              <label
                className={twClass(
                  "flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-500",
                )}
              >
                <MapPin size={16} />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("customer.mobile.location")}
                  className={twClass(
                    "min-w-0 w-full border-0 bg-transparent text-[10px] text-slate-700 outline-none",
                  )}
                />
              </label>
            </div>
            <Link
              to={`/find-workers?${mobileSearchParams}`}
              className={twClass(
                "mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm",
              )}
            >
              <Search size={18} />
              {t("customer.mobile.search")}
            </Link>
          </div>
        </section>
        <section
          className={twClass(
            "mx-4 mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4",
          )}
        >
          <div className={twClass("flex items-center gap-3")}>
            <span className={twClass("text-3xl text-emerald-600")}>✦</span>
            <div>
              <b
                className={twClass("block text-sm font-black text-emerald-700")}
              >
                {t("customer.hero.trusted")}
              </b>
              <small className={twClass("text-[10px] text-slate-600")}>
                {t("customer.hero.trustedSub")}
              </small>
            </div>
          </div>
          <div
            className={twClass(
              "mt-3 grid grid-cols-3 divide-x divide-emerald-200",
            )}
          >
            <div className={twClass("text-center")}>
              <Users size={19} className={twClass("mx-auto text-[#083968]")} />
              <b
                className={twClass(
                  "mt-1 block text-sm font-black text-[#083968]",
                )}
              >
                {stats.workers || "—"}+
              </b>
              <small className={twClass("text-[9px] text-slate-500")}>
                {t("customer.hero.verifiedWorkers")}
              </small>
            </div>
            <div className={twClass("text-center")}>
              <BriefcaseBusiness
                size={19}
                className={twClass("mx-auto text-[#083968]")}
              />
              <b
                className={twClass(
                  "mt-1 block text-sm font-black text-[#083968]",
                )}
              >
                {stats.completedJobs || "—"}+
              </b>
              <small className={twClass("text-[9px] text-slate-500")}>
                {t("customer.hero.jobsCompleted")}
              </small>
            </div>
            <div className={twClass("text-center")}>
              <Star size={19} className={twClass("mx-auto text-[#083968]")} />
              <b
                className={twClass(
                  "mt-1 block text-sm font-black text-[#083968]",
                )}
              >
                {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}/5
              </b>
              <small className={twClass("text-[9px] text-slate-500")}>
                {t("customer.hero.userRating")}
              </small>
            </div>
          </div>
        </section>
        <section className={twClass("px-4 pb-20 pt-5")}>
          <div className={twClass("mb-3 flex items-end justify-between gap-2")}>
            <div>
              <h2 className={twClass("text-[20px] font-black text-[#083968]")}>
                {t("customer.mobile.workersTitle")}
              </h2>
              <p className={twClass("mt-0.5 text-[11px] text-slate-500")}>
                {t("customer.mobile.workersSub")}
              </p>
            </div>
            <Link
              to="/find-workers"
              className={twClass(
                "shrink-0 text-xs font-black text-emerald-600",
              )}
            >
              {t("customer.mobile.viewAll")}{" "}
              <ArrowRight size={14} className={twClass("inline")} />
            </Link>
          </div>
          {workers.length ? (
            <div className={twClass("grid gap-3")}>
              {workers.map(workerCard)}
            </div>
          ) : (
            <div
              className={twClass(
                "rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400",
              )}
            >
              {t("customer.mobile.noWorkers")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
