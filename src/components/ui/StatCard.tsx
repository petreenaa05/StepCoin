interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <div
      className="backdrop-blur-lg rounded-2xl p-6 transition-all duration-300 group border hover:scale-[1.02]"
      style={{
        backgroundColor: "var(--surface-card)",
        borderColor: "var(--surface-border)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--surface-card-hover)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--surface-card)")
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold font-mono"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <div
          className={`w-10 h-10 ${color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-2xl font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
        {trend && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              trend.isPositive ? "text-green-300" : "text-red-300"
            }`}
            style={{
              backgroundColor: trend.isPositive
                ? "rgba(34, 197, 94, 0.2)"
                : "rgba(239, 68, 68, 0.2)",
            }}
          >
            {trend.isPositive ? "↗" : "↘"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
