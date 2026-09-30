import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import {
  Bot,
  Heart,
  MapPin,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import {
  catalogApi,
  fileUrl,
  type Category,
  type PublicWorker,
  workersApi,
} from "../../lib/api";
import { useAuthStore } from "../auth/auth.store";
import { toast } from "sonner";

const experienceOptions = ["any", "1", "3", "5"] as const;
const sortOptions = ["best", "nearest", "topRated"] as const;
export default function FindWorkersPage() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [district, setDistrict] = useState(params.get("location") || "");
  const [minExp, setMinExp] =
    useState<(typeof experienceOptions)[number]>("any");
  const [verified, setVerified] = useState(true);
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("best");
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [workers, setWorkers] = useState<PublicWorker[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([catalogApi.categories(), catalogApi.locations()])
      .then(([c, l]) => {
        setCategories(c.categories || []);
        setDistricts(l.districts || []);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!token) return;
    workersApi
      .favorites()
      .then((r) => setFavorites(new Set(r.workerIds || [])))
      .catch(() => undefined);
  }, [token]);
  const toggleFavorite = async (id: string) => {
    if (!token) {
      toast.info("Please login to save workers");
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
          ? "Worker added to favorites"
          : "Worker removed from favorites",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update favorite");
    }
  };
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const value =
      categories.find(
        (c) =>
          c._id === category ||
          c.name.toLowerCase() === category.trim().toLowerCase() ||
          (c.slug || "").toLowerCase() === category.trim().toLowerCase(),
      )?.slug || category;
    workersApi
      .search({
        q,
        category: value || undefined,
        district: district || undefined,
        experienceMin: minExp === "any" ? undefined : Number(minExp),
        verified,
        limit: 24,
      })
      .then((r) => {
        if (!cancelled) {
          setWorkers(r.workers || []);
          setTotal(r.pagination?.total || 0);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setWorkers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, category, district, minExp, verified, categories]);
  const sorted = [...workers].sort((a, b) =>
    sort === "topRated"
      ? (b.rating || 0) - (a.rating || 0)
      : sort === "nearest"
        ? `${a.district || ""}${a.taluka || ""}`.localeCompare(
            `${b.district || ""}${b.taluka || ""}`,
          )
        : (b.rating || 0) * 10 +
          (b.completedJobs || 0) / 100 -
          ((a.rating || 0) * 10 + (a.completedJobs || 0) / 100),
  );
  return (
    <div className={twClass("wf-page")}>
      <div className={twClass("wf-wide")}>
        <section className={twClass("wf-page-hero")}>
          <div>
            <span className={twClass("wf-kicker")}>
              <UsersIcon /> WORKFORCE DIRECTORY
            </span>
            <h1>{t("customer.findWorkers.title")}</h1>
            <p>{t("customer.findWorkers.subtitle")}</p>
          </div>
          <Link to="/workguide" className={twClass("wf-outline-btn")}>
            <Bot size={15} /> Ask WorkGuide
          </Link>
        </section>
        <div className={twClass("wf-find-layout")}>
          <aside className={twClass("wf-filter-card")}>
            <div className={twClass("wf-filter-head")}>
              <h3>
                <SlidersHorizontal size={17} />{" "}
                {t("customer.findWorkers.filterTitle")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCategory("");
                  setDistrict("");
                  setMinExp("any");
                  setVerified(true);
                }}
              >
                Reset
              </button>
            </div>
            <label>
              Search
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("customer.findWorkers.searchPlaceholder")}
              />
            </label>
            <label>
              Category
              <input
                list="find-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="All categories"
              />
            </label>
            <label>
              Location
              <input
                list="find-locations"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="All locations"
              />
            </label>
            <label>
              Experience
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value as typeof minExp)}
              >
                {experienceOptions.map((v) => (
                  <option key={v} value={v}>
                    {t(`customer.findWorkers.experienceOptions.${v}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                {sortOptions.map((v) => (
                  <option key={v} value={v}>
                    {t(`customer.findWorkers.sortOptions.${v}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className={twClass("wf-check")}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />{" "}
              Verified professionals only
            </label>
            <datalist id="find-categories">
              {categories.map((c) => (
                <option key={c._id} value={c.name} />
              ))}
            </datalist>
            <datalist id="find-locations">
              {districts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </aside>
          <section className={twClass("wf-results")}>
            <div className={twClass("wf-results-head")}>
              <div>
                <b>{total || workers.length} professionals</b>
                <small>Real-time results from WORKFORCE</small>
              </div>
              <div className={twClass("wf-sort-pills")}>
                {sortOptions.map((v) => (
                  <button
                    key={v}
                    className={sort === v ? "active" : ""}
                    onClick={() => setSort(v)}
                  >
                    {t(`customer.findWorkers.sortOptions.${v}`)}
                  </button>
                ))}
              </div>
            </div>
            {loading && (
              <div className={twClass("wf-empty")}>
                Loading verified workers…
              </div>
            )}
            {!loading && error && (
              <div className={twClass("wf-empty")}>
                <X size={26} />
                <p>{error}</p>
                <button onClick={() => toast.error(error)}>Retry</button>
              </div>
            )}
            {!loading && !error && !sorted.length && (
              <div className={twClass("wf-empty")}>
                No workers match these filters.
              </div>
            )}
            {sorted.map((w) => (
              <article
                className={twClass("wf-result-card relative")}
                key={w.id}
              >
                <button
                  type="button"
                  onClick={() => void toggleFavorite(w.id)}
                  className={twClass(
                    `absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow ${favorites.has(w.id) ? "text-rose-600" : "text-slate-500"}`,
                  )}
                  aria-label="Favorite worker"
                >
                  <Heart
                    size={16}
                    fill={favorites.has(w.id) ? "currentColor" : "none"}
                  />
                </button>
                <img
                  src={fileUrl(w.profileImage) || "/worker-carpenter.jpg"}
                  onError={(e) => {
                    e.currentTarget.src = "/worker-carpenter.jpg";
                  }}
                  alt={w.name}
                />
                <div className={twClass("wf-result-main")}>
                  <div className={twClass("wf-result-name")}>
                    <h2>{w.name}</h2>
                    {w.verificationStatus === "approved" && (
                      <span>
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <p className={twClass("wf-result-role")}>
                    {w.profession || w.headline || "Professional"}
                  </p>
                  <p className={twClass("wf-result-meta")}>
                    <Star size={13} fill="currentColor" />{" "}
                    {w.rating ? w.rating.toFixed(1) : "—"} <span>·</span>{" "}
                    {w.experienceYears ?? "—"} years <span>·</span>{" "}
                    <MapPin size={13} />{" "}
                    {[w.locality, w.taluka, w.district]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                  <div className={twClass("wf-tags")}>
                    {(w.skills || []).slice(0, 5).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className={twClass("wf-result-actions")}>
                  <Link to={`/workguide?worker=${w.id}`}>
                    <Bot size={14} /> AI guidance
                  </Link>
                  <Link to={`/find-workers/${w.id}`}>
                    View Profile <ArrowRight size={14} />
                  </Link>
                  <Link
                    className={twClass("primary")}
                    to={`/post-requirement?worker=${w.id}`}
                  >
                    Request for Work
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
function UsersIcon() {
  return <ShieldCheck size={14} />;
}
