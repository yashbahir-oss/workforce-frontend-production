import { twClass } from "../../lib/tw";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  MessageSquareWarning,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [ct, setCt] = useState<{ date: string; count: number }[]>([]);
  const [ut, setUt] = useState<
    { date: string; total: number; workers: number; customers: number }[]
  >([]);
  const [st, setSt] = useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([
        adminApi.complaintsTrend(30),
        adminApi.usersTrend(30),
        adminApi.complaintsStatus(),
      ]);
      setCt(a.trend || []);
      // setUt(b.trend || []);
      setUt(Array.isArray(b?.trend) ? b.trend : []);
      setSt(c.statuses || []);
    } catch (e) {
      setCt([]);
      setUt([]);
      setSt([]);
      toast.error(e instanceof Error ? e.message : "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const complaintMax = useMemo(
    () => Math.max(1, ...ct.map((x) => x.count)),
    [ct],
  );
  const userMax = useMemo(() => Math.max(1, ...ut.map((x) => x.total)), [ut]);

  return (
    <div className={twClass("min-w-0")}>
      <div className={twClass("gls-admin-page-title")}>
        <div className={twClass("min-w-0")}>
          <p>{t("admin.nav.analytics")}</p>
          <h1 className={twClass("wrap-break-word")}>
            {t("admin.analytics.title")}
          </h1>
          <span className={twClass("wrap-break-word")}>
            {t("admin.analytics.subtitle")}
          </span>
        </div>
        <button
          className={twClass("gls-admin-refresh shrink-0")}
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {t("admin.common.refresh")}
        </button>
      </div>

      {loading ? (
        <div className={twClass("gls-admin-loading")}>
          {t("admin.common.loading")}
        </div>
      ) : (
        <>
          <div className={twClass("gls-admin-analytics-grid")}>
            <section className={twClass("gls-admin-card-v2 min-w-0")}>
              <h2>
                <MessageSquareWarning size={18} />
                {t("admin.analytics.complaints")}
              </h2>
              <div
                className={twClass("gls-bars")}
                aria-label={t("admin.analytics.complaints")}
              >
                {ct.map((x) => (
                  <span
                    key={x.date}
                    title={`${x.date}: ${x.count}`}
                    style={{
                      height: `${Math.max(4, (x.count / complaintMax) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              {!ct.length && (
                <div className={twClass("gls-admin-empty-v2")}>
                  No complaint data available.
                </div>
              )}
            </section>

            <section className={twClass("gls-admin-card-v2 min-w-0")}>
              <h2>
                <Users size={18} />
                {t("admin.analytics.users")}
              </h2>
              <div
                className={twClass("gls-bars users")}
                aria-label={t("admin.analytics.users")}
              >
                {ut.map((x) => (
                  <span
                    key={x.date}
                    title={`${x.date}: ${x.total}`}
                    style={{
                      height: `${Math.max(4, (x.total / userMax) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              {!ut.length && (
                <div className={twClass("gls-admin-empty-v2")}>
                  No user registration data available.
                </div>
              )}
            </section>
          </div>

          <section className={twClass("gls-admin-card-v2 min-w-0")}>
            <h2>
              <BarChart3 size={18} />
              {t("admin.analytics.status")}
            </h2>
            <div className={twClass("gls-admin-status-grid")}>
              {st.map((x) => (
                <div key={x.status} className={twClass("min-w-0")}>
                  <span>{x.status}</span>
                  <b>{x.count}</b>
                </div>
              ))}
            </div>
            {!st.length && (
              <div className={twClass("gls-admin-empty-v2")}>
                No complaint status data available.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
