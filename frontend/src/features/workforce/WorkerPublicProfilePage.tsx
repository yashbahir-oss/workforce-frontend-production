import { twClass } from "../../lib/tw";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useEffect, useState } from "react";
import { fileUrl, type PublicWorker, workersApi } from "../../lib/api";

export default function WorkerPublicProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<PublicWorker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    workersApi
      .get(id)
      .then((r) => setWorker(r.worker))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading)
    return (
      <div className={twClass("wf-page")}>
        <div className={twClass("wf-shell wf-panel wf-not-found")}>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  if (!worker || error)
    return (
      <div className={twClass("wf-page")}>
        <div className={twClass("wf-shell wf-panel wf-not-found")}>
          <h2>{error || t("customer.profilePage.notFound")}</h2>
          <Link className={twClass("wf-primary")} to="/find-workers">
            {t("customer.profilePage.back")}
          </Link>
        </div>
      </div>
    );
  const place =
    [worker.locality, worker.taluka, worker.district]
      .filter(Boolean)
      .join(", ") || "—";
  return (
    <div className={twClass("wf-page")}>
      <div className={twClass("wf-shell")}>
        <button
          className={twClass("wf-back-button")}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={15} /> {t("common.back")}
        </button>
        <section className={twClass("wf-public-profile wf-panel")}>
          <div className={twClass("wf-public-cover")} />
          <div className={twClass("wf-public-main")}>
            <img
              className={twClass("wf-public-avatar")}
              src={fileUrl(worker.profileImage) || "/workforce-logo.png"}
              alt={worker.name}
            />
            <div className={twClass("wf-public-heading")}>
              <div className={twClass("wf-row-title")}>
                <h1>{worker.name}</h1>
                {worker.verificationStatus === "approved" && (
                  <span className={twClass("wf-verified")}>
                    <CheckCircle2 size={12} />{" "}
                    {t("customer.findWorkers.verified")}
                  </span>
                )}
              </div>
              <p>
                {worker.profession || worker.headline} · <MapPin size={13} />{" "}
                {place}
              </p>
              <div className={twClass("wf-public-rating")}>
                <Star size={15} fill="currentColor" />{" "}
                {worker.rating ? worker.rating.toFixed(1) : "—"} ·{" "}
                {worker.ratingCount || 0} {t("customer.profilePage.reviews")}
              </div>
            </div>
            <div className={twClass("wf-public-actions")}>
              <Link
                className={twClass("wf-primary")}
                to={`/post-requirement?worker=${worker.id}`}
              >
                <CalendarCheck2 size={15} />{" "}
                {t("customer.findWorkers.postRequirement")}
              </Link>
            </div>
          </div>
          <div className={twClass("wf-public-grid")}>
            <div>
              <h2>{t("customer.profilePage.about")}</h2>
              <p>{worker.bio || "—"}</p>
              <h2>{t("customer.profilePage.skills")}</h2>
              <div className={twClass("wf-tags")}>
                {(worker.skills || []).map((s) => (
                  <span className={twClass("wf-tag")} key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <aside className={twClass("wf-public-summary")}>
              <div>
                <BriefcaseBusiness size={16} />
                <span>
                  <b>{t("customer.messages.experience")}</b>
                  {worker.experienceYears || 0}{" "}
                  {t("customer.findWorkers.years", "years")}
                </span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>
                  <b>{t("customer.profilePage.verification")}</b>
                  {worker.verificationStatus || "—"}
                </span>
              </div>
              <div>
                <MapPin size={16} />
                <span>
                  <b>{t("customer.messages.location")}</b>
                  {place}
                </span>
              </div>
              <div>
                <MessageCircle size={16} />
                <span>
                  <b>{t("customer.profilePage.rate")}</b>
                  {worker.responseRate ? `${worker.responseRate}%` : "—"}
                </span>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
