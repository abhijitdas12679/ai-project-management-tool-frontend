export default function KpiCard({
  icon,
  value,
  label,
  color,
  trend,
}) {
  return (
    <div className="premium-kpi-card">
      <div
        className="kpi-icon"
        style={{
          background: color?.bg,
          color: color?.fg,
        }}
      >
        {icon}
      </div>

      <div className="premium-kpi-content">
        <span className="premium-kpi-label">
          {label}
        </span>

        <h2 className="premium-kpi-value">
          {value}
        </h2>

        {trend && (
          <span className="premium-kpi-trend">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}