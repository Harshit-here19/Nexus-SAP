import React, { useEffect, useRef, useState } from "react";
import styles from "./SpendingBarChart.module.css";

const SpendingBarChart = ({
  data = [],
  formatCurrency,
  title = "Monthly Trend",
  subtitle = "",
}) => {
  const chartRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  /* ==========================================================================
     1. LIFECYCLE EFFECTS (Intersection Observer & Animation Timing)
     ========================================================================== */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 },
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    setAnimate(false);
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [data, visible]);

  /* ==========================================================================
     2. GUARD CLAUSE (Empty State Return)
     ========================================================================== */
  if (!data.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        No trend data available
      </div>
    );
  }

  /* ==========================================================================
     3. CHART GEOMETRY & MATH CALCULATIONS
     ========================================================================== */
  const width = 500;
  const height = 280;
  const padding = { top: 30, right: 25, bottom: 50, left: 70 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map((item) => Number(item.total)), 1);
  const barGap = 18;
  const barWidth = (chartWidth - barGap * (data.length - 1)) / data.length;

  /* ==========================================================================
     4. COMPONENT RENDERING (JSX)
     ========================================================================== */
  return (
    <div ref={chartRef} className={styles.container}>
      {/* Chart Header */}
      <div className={styles.header}>
        <div>
          <h3>{title}</h3>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`${styles.chart} ${animate ? styles.chartAnimate : ""}`}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis Scale */}
          {[0, 1, 2, 3, 4].map((step) => {
            const y = padding.top + (step / 4) * chartHeight;
            const value = maxValue - (step / 4) * maxValue;

            return (
              <g key={step}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className={styles.grid}
                />
                <text x="10" y={y + 4} className={styles.axisText}>
                  {formatCurrency
                    ? formatCurrency(value, true)
                    : Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* Baseline X-Axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            className={styles.axis}
          />

          {/* Bar Chart Bars */}
          {data.map((item, index) => {
            const barHeight = (Number(item.total) / maxValue) * chartHeight;
            const x = padding.left + index * (barWidth + barGap);
            const y = height - padding.bottom - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={animate ? y : height - padding.bottom}
                  width={barWidth}
                  height={animate ? barHeight : 0}
                  rx="8"
                  className={`
                    ${animate ? styles.barAnimate : ""}
                    ${hoveredBar === index ? styles.barHover : styles.bar}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={(e) => {
                    setHoveredBar(index);

                    const chartRect = chartRef.current.getBoundingClientRect();

                    setTooltip({
                      x: e.clientX - chartRect.left,
                      y: e.clientY - chartRect.top,
                      label: item.month,
                      value: item.total,
                      category: item.topCategory?.name || "No category",
                      categoryAmount: item.topCategory?.amount || 0,
                    });
                  }}
                  onMouseMove={(e) => {
                    const chartRect = chartRef.current.getBoundingClientRect();
                    setTooltip((prev) => ({
                      ...prev,
                      x: e.clientX - chartRect.left,
                      y: e.clientY - chartRect.top,
                    }));
                  }}
                  onMouseLeave={() => {
                    setHoveredBar(null);
                    setTooltip(null);
                  }}
                />

                {/* X-Axis labels (Months) */}
                <text
                  x={x + barWidth / 2}
                  y={height - 25}
                  textAnchor="middle"
                  className={styles.label}
                >
                  {item.month}
                </text>

                {/* Values atop bars (only if bar is tall enough) */}
                {barHeight > 35 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className={styles.value}
                  >
                    {formatCurrency
                      ? formatCurrency(item.total, true)
                      : item.total}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltip.x - 10,
              top: tooltip.y - 40,
            }}
          >
            <strong>{tooltip.label}</strong>
            <div>
              {formatCurrency ? formatCurrency(tooltip.value) : tooltip.value}
            </div>

            {tooltip.category && (
              <>
                <div className={styles.tooltipCategory}>
                  🏷️ {tooltip.category}
                </div>
                <div className={styles.tooltipCategoryAmount}>
                  {formatCurrency(tooltip.categoryAmount)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingBarChart;
