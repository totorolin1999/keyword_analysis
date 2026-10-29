import useAxios from "../utils/useAxios";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TrackChart from "../components/TrackChart";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import API_BASE_URL from '../apiConfig';

const CHART_COLORS = [
  { border: "rgba(54, 162, 235, 1)", bg: "rgba(54, 162, 235, 0.2)" },
  { border: "rgba(255, 99, 132, 1)", bg: "rgba(255, 99, 132, 0.2)" },
  { border: "rgba(75, 192, 192, 1)", bg: "rgba(75, 192, 192, 0.2)" },
  { border: "rgba(255, 159, 64, 1)", bg: "rgba(255, 159, 64, 0.2)" },
  { border: "rgba(153, 102, 255, 1)", bg: "rgba(153, 102, 255, 0.2)" },
];

const Track = () => {
  const { id: routeId } = useParams();
  const trackId = routeId;

  const [track, setTrack] = useState({
    Track_ID: null,
    Industries: [],
    Times: [],
    Keyword: "",
  });

  const [stockCharts, setStockCharts] = useState([]);
  const [predict, setPredict] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [isUpdatingTrack, setIsUpdatingTrack] = useState(false);

  const api = useAxios();

  const fetchTrackData = async () => {
    setShowSpinner(true);
    try {
      const res = await api.get(`${API_BASE_URL}/api/track-detail/${trackId}/`);
      setTrack(res.data);

      const times = res.data.Times || [];
      const timeQuery = times.length > 0 ? times[0].Date : "";
      const industries = res.data.Industries || [];

      const charts = [];
      for (let i = 0; i < industries.length; i++) {
        const categoryId = industries[i].Industry_ID;
        try {
          const chartRes = await axios.get(
            `${API_BASE_URL}/api/stock-chart/?time=${encodeURIComponent(timeQuery)}&category=${categoryId}&predict=${predict}`
          );
          if (chartRes.data && chartRes.data.length > 0 && chartRes.data[0].date) {
            charts.push({
              categoryName: industries[i].Name,
              chartData: {
                labels: chartRes.data[0].date,
                datasets: chartRes.data.map((item, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return {
                    label: item.name,
                    data: item.close,
                    borderColor: color.border,
                    backgroundColor: color.bg,
                  };
                }),
              }
            });
          }
        } catch (chartErr) {
          console.error(`獲取產業 ${industries[i].Name} 圖表失敗:`, chartErr);
        }
      }
      setStockCharts(charts);
    } catch (err) {
      console.error("無法取得追蹤明細:", err);
    } finally {
      setShowSpinner(false);
    }
  };

  useEffect(() => {
    if (trackId) {
      fetchTrackData();
    }
  }, [trackId, predict]);

  const handleTrackTimeUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingTrack(true);
    try {
      const res = await api.post(`${API_BASE_URL}/api/track-time-create/${trackId}/`);
      alert(res.data.Message || "追蹤紀錄已更新！");
      // 更新本機狀態，避免整頁重新整理
      setTrack(res.data);
    } catch (err) {
      console.error("更新追蹤失敗:", err);
      alert("更新追蹤失敗，請稍後再試！");
    } finally {
      setIsUpdatingTrack(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/Tracks" className="btn btn-outline-secondary btn-sm">
          &larr; 返回所有追蹤
        </Link>
        {!showInfo && (
          <Button onClick={() => setShowInfo(true)} variant="success" size="sm">
            顯示追蹤資訊
          </Button>
        )}
      </div>

      <Alert show={showInfo} variant="success">
        <Alert.Heading>關注熱搜字：{track.Keyword}</Alert.Heading>
        <div className="mb-2">
          <strong>關聯產業：</strong>
          {track.Industries?.map((industry, index) => (
            <span key={index} className="badge bg-success me-1">
              {industry.Name}
            </span>
          ))}
        </div>
        <div>
          <strong>追蹤時間序列：</strong>
          {track.Times?.map((time, index) => (
            <span key={index} className="badge bg-secondary me-1">
              {time.Date}
            </span>
          ))}
        </div>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => setShowInfo(false)} variant="outline-success" size="sm">
            關閉資訊面板
          </Button>
        </div>
      </Alert>

      {showSpinner ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">正在繪製股價與走勢預測圖表...</p>
        </div>
      ) : stockCharts.length > 0 ? (
        stockCharts.map((item, idx) => (
          <div key={idx} className={idx > 0 ? "mt-5" : "mt-4"}>
            <h5 className="text-muted mb-3">產業標的：{item.categoryName}</h5>
            <TrackChart chartData={item.chartData} trackData={track} />
          </div>
        ))
      ) : (
        <Alert variant="warning">此追蹤項目目前尚無足夠的歷史股價資料。</Alert>
      )}

      {stockCharts.length > 0 && !showSpinner && (
        <div className="my-5 text-center">
          <Button
            variant="success"
            onClick={handleTrackTimeUpdate}
            disabled={isUpdatingTrack}
            className="me-2"
          >
            {isUpdatingTrack ? "記錄中..." : "新增今日追蹤點"}
          </Button>
          <Button
            variant={predict ? "secondary" : "outline-success"}
            onClick={() => setPredict(!predict)}
          >
            {predict ? "顯示原始走勢" : "進行股價走勢預測"}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Track;
