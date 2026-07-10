import React, { useEffect, useRef, useState } from "react";
import styles from "./SpendingPieChart.module.css";

const polarToCartesian = (cx, cy, radius, angle) => {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),

    y: cy + radius * Math.sin(radians),
  };
};

const createSlicePath = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);

  const end = polarToCartesian(cx, cy, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${cx} ${cy}`,

    `L ${start.x} ${start.y}`,

    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,

    "Z",
  ].join(" ");
};

const SpendingPieChart = ({
  data = [],
  total = 0,
  formatCurrency,
  lang = "en",
}) => {
  const chartRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  /*
      Trigger animation only when
      chart enters viewport
  */

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setAnimate(true);
        } else {
          setVisible(false);
          setAnimate(false);
        }
      },
      {
        threshold: 0.3,
      },
    );

    const element = chartRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }

      observer.disconnect();
    };
  }, []);

  /*
      Retrigger animation
      when filter changes
  */

  useEffect(() => {
    if (!visible) return;

    setAnimate(false);

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });

    return () => cancelAnimationFrame(id);
  }, [data, visible]);

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📭</div>
        No expense data available
      </div>
    );
  }

  const size = 260;

  const center = size / 2;

  const radius = 105;

  const holeRadius = 48;

  let currentAngle = 0;

  return (
    <div ref={chartRef} className={styles.container}>
      <div className={styles.chartWrapper}>
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.chart}>
          <g>
            {data.map((item, index) => {
              const percentage = Number(item.percentage);

              const angle = percentage * 3.6;

              const start = currentAngle;

              const end = currentAngle + angle;

              currentAngle = end;

              const path = createSlicePath(center, center, radius, start, end);

              return (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  className={`${animate ? styles.sliceAnimate : styles.slice} ${
                    hoveredSlice === index ? styles.sliceHover : ""
                  }`}
                  style={{
                    animationDelay: `${index * 120}ms`,
                  }}
                  onMouseEnter={(e) => {
                    setHoveredSlice(index);

                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      name: item.label?.[lang] || item.label,
                      percentage: item.percentage,
                      total: item.total,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredSlice(null);
                    setTooltip(null);
                  }}
                />
              );
            })}
          </g>

          {/* center hole */}

          <circle
            cx={center}
            cy={center}
            r={holeRadius}
            className={styles.hole}
          />
        </svg>
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
            }}
          >
            <strong>{tooltip.name}</strong>

            <div>
              {tooltip.percentage}% · {formatCurrency(tooltip.total)}
            </div>
          </div>
        )}

        <div className={animate ? styles.centerAnimate : styles.center}>
          <div className={styles.totalLabel}>TOTAL</div>

          <div className={styles.totalValue}>{formatCurrency(total, true)}</div>
        </div>
      </div>

      <div className={animate ? styles.legendAnimate : styles.legend}>
        {data.slice(0, 6).map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{
                background: item.color,
              }}
            />

            <span className={styles.legendName}>
              {item.label[lang].split(" ").slice(1).join(" ")}
            </span>

            <span className={styles.legendValue}>
              {formatCurrency(item.total)}
            </span>

            <span className={styles.legendPercent}>{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingPieChart;
