import React, { useEffect, useRef, useState } from "react";
import styles from "./SpendingLineChart.module.css";

const SpendingLineChart = ({
  data = [],
  height = 300,
  currencyFormatter,
  title = "Spending Overview",
  range,
  setRange,
}) => {
  if (!data.length) {
    return <div className={styles.empty}>No spending data available</div>;
  }

  const width = 720;

  const chartRef = useRef(null);
  const lineRef = useRef(null);

  const [animate, setAnimate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lineLength, setLineLength] = useState(0);

  useEffect(() => {
    if (lineRef.current) {
      setLineLength(lineRef.current.getTotalLength());
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);

        if (entry.isIntersecting) {
          setAnimate(true);
        } else {
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

  useEffect(() => {
    if (!isVisible) return;

    setAnimate(false);

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });

    return () => cancelAnimationFrame(id);
  }, [data, isVisible]);

  //   useEffect(() => {
  //     setAnimate(false);

  //     const timer = setTimeout(() => {
  //       setAnimate(true);
  //     }, 50);

  //     return () => clearTimeout(timer);
  //   }, [data]);

  const padding = {
    top: 35,
    right: 25,
    bottom: 45,
    left: 65,
  };

  const chartWidth = width - padding.left - padding.right;

  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((item) => item.total), 1);

  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;

    const y = padding.top + chartHeight - (item.total / maxValue) * chartHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${
      height - padding.bottom
    } Z`;

  const ySteps = 5;

  return (
    <div ref={chartRef} className={styles.container}>
      <div className={styles.header}>
        <h3>{title}</h3>

        <select
          className={styles.filterSelect}
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{height:"40px"}}
        >
          <option value="7days">Last 7 Days</option>

          <option value="10days">Last 10 Days</option>

          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity=".35" />

            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y axis grid */}
        {Array.from({ length: ySteps + 1 }).map((_, i) => {
          const y = padding.top + (i / ySteps) * chartHeight;

          const value = maxValue - (i / ySteps) * maxValue;

          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className={styles.grid}
              />

              <text x="10" y={y + 4} className={styles.axisText}>
                {currencyFormatter
                  ? currencyFormatter(value)
                  : value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className={styles.axis}
        />

        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className={styles.axis}
        />

        {/* Area */}
        <path
          d={areaPath}
          fill="url(#spendGradient)"
          className={animate ? styles.areaAnimate : styles.area}
        />

        {/* Line */}
        <path
          ref={lineRef}
          d={linePath}
          style={{
            "--line-length": lineLength,
          }}
          fill="none"
          stroke="#6366f1"
          strokeWidth="4"
          strokeLinecap="round"
          className={animate ? styles.lineAnimate : styles.line}
        />

        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="6" className={styles.dot} />

            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className={styles.value}
            >
              {currencyFormatter ? currencyFormatter(point.total) : point.total}
            </text>
          </g>
        ))}

        {/* X labels */}

        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 18}
            textAnchor="middle"
            className={styles.axisText}
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default SpendingLineChart;
