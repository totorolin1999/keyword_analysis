import useAxios from "../utils/useAxios";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TrackChart from "../components/TrackChart";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import API_BASE_URL from "../apiConfig";

const CHART_COLORS = [
  { border: "rgba(16, 185, 129, 1)", bg: "rgba(16, 185, 129, 0.15)" },
  { border: "rgba(59, 130, 246, 1)", bg: "rgba(59, 130, 246, 0.15)" },
  { border: "rgba(249, 115, 22, 1)", bg: "rgba(249, 115, 22, 0.15)" },
  { border: "rgba(168, 85, 247, 1)", bg: "rgba(168, 85, 247, 0.15)" },
  { border: "rgba(236, 72, 153, 1)", bg: "rgba(236, 72, 153, 0.15)" },
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
  const [showSpinner, setShowSpinner] = useState(false);
  const [isUpdatingTrack, setIsUpdatingTrack] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

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
                    borderWidth: 2,
                    pointRadius: 2.5,
                    pointHoverRadius: 5,
                    tension: 0.2,
                  };
                }),
              },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, predict]);

  const handleTrackTimeUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingTrack(true);
    try {
      const res = await api.post(`${API_BASE_URL}/api/track-time-create/${trackId}/`);
      setFeedbackMsg(res.data.Message || "追蹤打卡紀錄已成功更新！");
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
      {/* Navigation & Header */}
      <div className="mb-4">
        <Link to="/Tracks" className="btn btn-outline-secondary btn-sm mb-3" style={{ borderRadius: "8px" }}>
          &larr; 返回追蹤清單
        </Link>
      </div>

      {/* Info Header Card */}
      <div className="bg-white rounded-3 border p-4 shadow-sm mb-4">
        <Row className="align-items-center">
          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                熱搜追蹤標的
              </span>
              <span className="text-muted small">ID: #{track.Track_ID}</span>
            </div>
            <h2 className="fw-bold text-dark mb-3">🎯 {track.Keyword}</h2>

            <div className="mb-2">
              <span className="text-muted small fw-bold me-2">關聯產業：</span>
              {track.Industries && track.Industries.length > 0 ? (
                track.Industries.map((industry, index) => (
                  <span key={index} className="badge bg-light text-dark border me-1">
                    {industry.Name}
                  </span>
                ))
              ) : (
                <span className="text-muted small">無</span>
              )}
            </div>

            <div>
              <span className="text-muted small fw-bold me-2">追蹤打卡點：</span>
              {track.Times && track.Times.length > 0 ? (
                track.Times.map((time, index) => (
                  <span key={index} className="badge bg-success-subtle text-success border border-success-subtle me-1">
                    📅 {time.Date}
                  </span>
                ))
              ) : (
                <span className="text-muted small">尚無紀錄</span>
              )}
            </div>
          </Col>

          <Col md={5} className="mt-3 mt-md-0 d-flex flex-column align-items-md-end gap-2">
            <Button
              className="btn-trend-primary w-100 w-md-auto"
              onClick={handleTrackTimeUpdate}
              disabled={isUpdatingTrack}
              size="sm"
            >
              {isUpdatingTrack ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  <span>記錄中...</span>
                </>
              ) : (
                <>
                  <span>➕ 新增今日打卡紀錄點</span>
                </>
              )}
            </Button>

            <Button
              className={predict ? "btn-trend-outline w-100 w-md-auto" : "btn btn-outline-secondary w-100 w-md-auto"}
              onClick={() => setPredict(!predict)}
              size="sm"
              style={{ borderRadius: "10px" }}
            >
              {predict ? "📊 顯示原始走勢" : "🔮 進行未來走勢預測"}
            </Button>
          </Col>
        </Row>
      </div>

      {feedbackMsg && (
        <Alert
          variant="info"
          onClose={() => setFeedbackMsg("")}
          dismissible
          className="shadow-sm border-0 mb-4"
        >
          {feedbackMsg}
        </Alert>
      )}

      {/* Chart Section */}
      {showSpinner ? (
        <div className="text-center py-5 bg-white rounded-3 border shadow-sm my-4">
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="mt-3 text-dark fw-bold">正在繪製走勢圖表...</h5>
          <p className="text-muted small">檢索時間序列數據與產業龍頭股報價</p>
        </div>
      ) : stockCharts.length > 0 ? (
        stockCharts.map((item, idx) => (
          <div key={idx} className="chart-card">
            <div className="chart-header">
              <h3 className="category-title">
                <span style={{ color: "#10b981" }}>●</span>
                產業標的：{item.categoryName}
              </h3>
              <span className="category-tag">
                {item.chartData.datasets.length} 檔龍頭概念股
              </span>
            </div>
            <TrackChart chartData={item.chartData} trackData={track} />
          </div>
        ))
      ) : (
        <Alert variant="warning" className="shadow-sm">
          ⚠️ 此追蹤項目目前尚無足夠的歷史股價資料。
        </Alert>
      )}
    </Container>
  );
};

export default Track;
