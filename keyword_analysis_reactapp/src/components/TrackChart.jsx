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
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "首次追蹤前兩周至今的股價走勢(X軸: 收盤價 NT, Y軸: 日期)",
      },
    },
  };

  const arbitraryLine = {
    id: "arbitraryLine",
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const {
        ctx,
        chartArea: { top, bottom, left, right, width, height },
        scales: { x, y },
      } = chart;
      ctx.save();

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "gray";
      trackData.Times.map(
        (item) => (
          ctx.moveTo(x.getPixelForValue(item.Date), top),
          ctx.lineTo(x.getPixelForValue(item.Date), bottom)
        )
      );
      // ["2023/06/22"].map(
      //   (item) => (
      //     ctx.moveTo(x.getPixelForValue(item), top),
      //     ctx.lineTo(x.getPixelForValue(item), bottom)
      //   )
      // );
      // ctx.moveTo(x.getPixelForValue("2023/06/12"), top);
      // ctx.lineTo(x.getPixelForValue("2023/06/12"), bottom);
      ctx.stroke();
      ctx.restore();
    },
  };

  return <Line data={chartData} options={options} plugins={[arbitraryLine]} />;
};

export default TrackChart;
