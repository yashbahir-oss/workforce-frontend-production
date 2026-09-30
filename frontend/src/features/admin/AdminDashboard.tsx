import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPin,
  RefreshCw,
  Users,
  UserRound,
  Layers3,
} from "lucide-react";
import { Link } from "react-router";
import { adminApi, fileUrl, type AdminStats } from "../../lib/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trend, setTrend] = useState<
    { date: string; total: number; workers: number; customers: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const [s, tr] = await Promise.all([
        adminApi.stats(),
        adminApi.usersTrend(14),
      ]);
      setStats(s);
      setTrend(tr.trend || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const max = Math.max(
    1,
    ...trend.map((x) => Math.max(x.total, x.workers, x.customers)),
  );
  const line = (key: "total" | "workers" | "customers") =>
    trend
      .map(
        (x, i) =>
          `${(i / Math.max(1, trend.length - 1)) * 100},${100 - (x[key] / max) * 82}`,
      )
      .join(" ");
  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          cls: "blue",
          to: "/admin/users",
        },
        {
          label: "Total Workers",
          value: stats.totalWorkers,
          icon: BriefcaseBusiness,
          cls: "green",
          to: "/admin/verification",
        },
        {
          label: "Total Customers",
          value: stats.totalCustomers,
          icon: UserRound,
          cls: "violet",
          to: "/admin/users",
        },
        {
          label: "Pending Verification",
          value: stats.pendingVerification,
          icon: ClipboardCheck,
          cls: "amber",
          to: "/admin/verification",
        },
        {
          label: "Active Bookings",
          value: stats.activeBookings,
          icon: CalendarDays,
          cls: "rose",
          to: "/admin/bookings",
        },
        {
          label: "Completed Jobs",
          value: stats.completedJobs,
          icon: CheckCircle2,
          cls: "cyan",
          to: "/admin/jobs",
        },
        {
          label: "Complaints",
          value: stats.totalComplaints,
          icon: AlertCircle,
          cls: "red",
          to: "/admin/complaints",
        },
        {
          label: "Categories",
          value: stats.totalCategories,
          icon: Layers3,
          cls: "purple",
          to: "/admin/settings",
        },
      ]
    : [];
  return (
    <div className={twClass('wf-admin-dashboard-ref')}>
      <div className={twClass('wf-admin-stat-grid-ref')}>
        {cards.map(({ label, value, icon: Icon, cls, to }) => (
          <Link key={label} to={to} className={twClass(`wf-admin-stat-ref ${cls}`)}>
            <span>
              <Icon size={20} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{loading ? "—" : value.toLocaleString()}</strong>
              <em>
                <Activity size={10} /> Live data
              </em>
            </div>
          </Link>
        ))}
      </div>
      <div className={twClass('wf-admin-main-grid-ref')}>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <div>
              <h2>User Growth</h2>
              <p>Live users created over the last 14 days.</p>
            </div>
            <span>Last 14 Days</span>
          </div>
          <div className={twClass('wf-admin-chart-ref')}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={line("total")}
                fill="none"
                stroke="#1675d1"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={line("workers")}
                fill="none"
                stroke="#10a86d"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={line("customers")}
                fill="none"
                stroke="#7b4de8"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="100"
                x2="100"
                y2="100"
                stroke="#dfe8ef"
                strokeWidth=".7"
              />
            </svg>
          </div>
          <div className={twClass('wf-chart-legend-ref')}>
            <span>
              <i className={twClass('blue')} /> Total Users
            </span>
            <span>
              <i className={twClass('green')} /> Workers
            </span>
            <span>
              <i className={twClass('purple')} /> Customers
            </span>
          </div>
        </section>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <div>
              <h2>Bookings Overview</h2>
              <p>Current booking status from MongoDB.</p>
            </div>
            <Link to="/admin/bookings">View All</Link>
          </div>
          <div className={twClass('wf-booking-overview-ref')}>
            {(stats?.bookingOverview || []).length ? (
              stats!.bookingOverview.map((x) => (
                <div key={x.status}>
                  <span className={twClass(`dot ${x.status}`)} />
                  <b>{x.status.replace("_", " ")}</b>
                  <strong>{x.count}</strong>
                </div>
              ))
            ) : (
              <div className={twClass('wf-empty')}>No bookings yet.</div>
            )}
          </div>
        </section>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <div>
              <h2>Quick Actions</h2>
              <p>Manage the platform quickly.</p>
            </div>
          </div>
          <div className={twClass('wf-admin-quick-ref')}>
            <Link to="/admin/verification">
              <ClipboardCheck size={17} />
              <span>
                <b>Add / Verify Worker</b>
                <small>Review worker verification</small>
              </span>
              <strong>›</strong>
            </Link>
            <Link to="/admin/documents">
              <FileText size={17} />
              <span>
                <b>Add Document</b>
                <small>Upload public documents</small>
              </span>
              <strong>›</strong>
            </Link>
            <Link to="/admin/bookings">
              <CalendarDays size={17} />
              <span>
                <b>View Bookings</b>
                <small>Manage active bookings</small>
              </span>
              <strong>›</strong>
            </Link>
            <Link to="/admin/analytics">
              <Activity size={17} />
              <span>
                <b>View Reports</b>
                <small>Open platform analytics</small>
              </span>
              <strong>›</strong>
            </Link>
          </div>
        </section>
      </div>
      <div className={twClass('wf-admin-lower-grid-ref')}>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <h2>Recent Users</h2>
            <Link to="/admin/users">View All</Link>
          </div>
          <div className={twClass('wf-admin-table-ref')}>
            <div className={twClass('wf-admin-table-row head')}>
              <span>Name</span>
              <span>Email / Phone</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
            </div>
            {(stats?.recentUsers || []).map((u: any) => (
              <div className={twClass('wf-admin-table-row')} key={u._id}>
                <span className={twClass('user-cell')}>
                  <img
                    src={
                      u.profileImage
                        ? fileUrl(u.profileImage)
                        : "/workforce-logo.png"
                    }
                    onError={(e) => {
                      e.currentTarget.src = "/workforce-logo.png";
                    }}
                    alt=""
                  />
                  <b>{u.name}</b>
                </span>
                <span>{u.email || u.mobile || "—"}</span>
                <span className={twClass('capitalize')}>{u.role}</span>
                <span>
                  <i className={twClass(`status-pill ${u.status || "active"}`)}>
                    {u.status || "active"}
                  </i>
                </span>
                <span>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            ))}
            {!stats?.recentUsers?.length && (
              <div className={twClass('wf-empty')}>No users yet.</div>
            )}
          </div>
        </section>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <h2>Top Categories</h2>
            <Link to="/admin/jobs">View All</Link>
          </div>
          <div className={twClass('wf-admin-list-ref')}>
            {(stats?.topCategories || []).map((x) => (
              <div key={x.category}>
                <span className={twClass('mini-icon')}>
                  <Layers3 size={14} />
                </span>
                <b>{x.category}</b>
                <small>
                  {x.jobs} jobs · {x.workersNeeded} workers needed
                </small>
              </div>
            ))}
            {!stats?.topCategories?.length && (
              <div className={twClass('wf-empty')}>No category activity yet.</div>
            )}
          </div>
        </section>
        <section className={twClass('wf-admin-panel-ref')}>
          <div className={twClass('wf-admin-panel-head-ref')}>
            <h2>Location Distribution</h2>
            <Link to="/admin/users">View All</Link>
          </div>
          <div className={twClass('wf-location-ref')}>
            <div className={twClass('location-visual')}>
              <MapPin size={42} />
            </div>
            <div>
              {(stats?.locationDistribution || []).map((x) => (
                <div key={x.district}>
                  <b>{x.district}</b>
                  <span>{x.workers}</span>
                </div>
              ))}
              {!stats?.locationDistribution?.length && (
                <p>No verified worker locations yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
      <section className={twClass('wf-admin-panel-ref wf-activity-ref')}>
        <div className={twClass('wf-admin-panel-head-ref')}>
          <h2>Recent Activity</h2>
          <span>Live</span>
        </div>
        <div className={twClass('activity-list')}>
          {(stats?.recentComplaints || []).map((c: any) => (
            <Link key={c._id} to="/admin/complaints">
              <span className={twClass('activity-icon')}>
                <AlertCircle size={15} />
              </span>
              <div>
                <b>Complaint received</b>
                <small>
                  {c.subject || c.complaintId || "Complaint"} · {c.status}
                </small>
              </div>
            </Link>
          ))}
          {!(stats?.recentComplaints || []).length && (
            <div className={twClass('wf-empty')}>No recent activity.</div>
          )}
        </div>
      </section>
      <div className={twClass('wf-admin-refresh-row-ref')}>
        <button onClick={() => void load()} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
          Refresh live data
        </button>
      </div>
    </div>
  );
}
