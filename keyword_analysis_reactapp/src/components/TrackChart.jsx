import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrackChart = ({ chartData, trackData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.2,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: {
            size: 13,
            weight: "600",
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          color: "#334155",
        },
      },
      title: {
        display: true,
        text: "追蹤時間序列與股價走勢 (X軸: 日期, Y軸: 收盤價, 灰垂直線: 追蹤紀錄點)",
        font: {
          size: 14,
          weight: "700",
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        color: "#1e293b",
        padding: {
          top: 4,
          bottom: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: "#f1f5f9",
          borderDash: [4, 4],
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
      },
    },
  };

  const arbitraryLine = {
    id: "arbitraryLine",
    beforeDatasetsDraw(chart) {
      if (!trackData || !trackData.Times || trackData.Times.length === 0) {
        return;
      }
      const {
        ctx,
        chartArea: { top, bottom },
        scales: { x },
      } = chart;

      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";

      trackData.Times.forEach((item) => {
        const xPos = x.getPixelForValue(item.Date);
        if (xPos !== undefined && !isNaN(xPos)) {
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.stroke();
        }
      });

      ctx.restore();
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "300px" }}>
      <Line data={chartData} options={options} plugins={[arbitraryLine]} />
    </div>
  );
};

export default TrackChart;
