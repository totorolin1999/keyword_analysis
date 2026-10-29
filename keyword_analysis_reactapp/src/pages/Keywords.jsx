import useAxios from "../utils/useAxios";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import LineChart from "../components/LineChart";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import AuthContext from "../context/AuthContext";
import API_BASE_URL from "../apiConfig";

// 專業對比調色盤
const CHART_COLORS = [
  { border: "rgba(16, 185, 129, 1)", bg: "rgba(16, 185, 129, 0.15)" },
  { border: "rgba(59, 130, 246, 1)", bg: "rgba(59, 130, 246, 0.15)" },
  { border: "rgba(249, 115, 22, 1)", bg: "rgba(249, 115, 22, 0.15)" },
  { border: "rgba(168, 85, 247, 1)", bg: "rgba(168, 85, 247, 0.15)" },
  { border: "rgba(236, 72, 153, 1)", bg: "rgba(236, 72, 153, 0.15)" },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "10px",
    borderColor: state.isFocused ? "#10b981" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(16, 185, 129, 0.15)" : "none",
    padding: "3px 4px",
    fontSize: "0.93rem",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#94a3b8",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "#ecfdf5" : "transparent",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    fontSize: "0.93rem",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#ecfdf5",
    borderRadius: "6px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#065f46",
    fontWeight: "600",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#065f46",
    "&:hover": {
      backgroundColor: "#d1fae5",
      color: "#047857",
    },
  }),
};

const Keywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [nations, setNations] = useState([]);
  const [selectedNation, setSelectedNation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [keywordDisabled, setKeywordDisabled] = useState(true);
  const [nationDisabled, setNationDisabled] = useState(true);
  const [categoryDisabled, setCategoryDisabled] = useState(true);

  // 統一圖表陣列狀態
  const [stockCharts, setStockCharts] = useState([]);

  const animatedComponents = makeAnimated();

  const [btnDisabled, setBtnDisabled] = useState(true);
  const [btn2Disabled, setBtn2Disabled] = useState(true);
  const [nationLoading, setNationLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinner2, setShowSpinner2] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const api = useAxios();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllKeywords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/keyword-list/`);
        setKeywords(res.data || []);
        setKeywordDisabled(false);
      } catch (err) {
        console.error("無法取得關鍵字清單:", err);
      }
    };
    fetchAllKeywords();
  }, []);

  const handleChange1 = async (selectedOption) => {
    setNationDisabled(true);
    setSelectedNation(null);
    setNationLoading(true);
    setCategoryDisabled(true);
    setSelectedCategories([]);
    setSelectedKeyword(selectedOption.value);
    setStockCharts([]);
    setShowBtn(false);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/nation-list/?keyword=${encodeURIComponent(selectedOption.value)}`
      );
      setNations(res.data || []);
      setNationDisabled(false);
    } catch (err) {
      console.error("無法取得股市類別:", err);
    } finally {
      setNationLoading(false);
    }
  };

  const handleChange2 = async (selectedOption) => {
    setSelectedNation(selectedOption);
    setCategoryDisabled(true);
    setBtnDisabled(true);
    setSelectedCategories([]);
    setCategoryLoading(true);
    setStockCharts([]);
    setShowBtn(false);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/category-list/?keyword=${encodeURIComponent(selectedKeyword)}&nation=${selectedOption.value}`
      );
      setCategories(res.data || []);
      setCategoryDisabled(false);
    } catch (err) {
      console.error("無法取得產業類別:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  // 抓取個股資料與建構 Chart.js 格式
  const fetchStockChartsData = async (isPredict = false) => {
    const charts = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/stock-chart/?category=${selectedCategories[i].value}${isPredict ? "&predict=true" : ""}`
        );
        if (res.data && res.data.length > 0 && res.data[0].date) {
          charts.push({
            categoryName: selectedCategories[i].label,
            chartData: {
              labels: res.data[0].date,
              datasets: res.data.map((item, idx) => {
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
      } catch (err) {
        console.error(`取得類股 ${selectedCategories[i].label} 失敗:`, err);
      }
    }
    return charts;
  };

  const handleSelect = async () => {
    setBtnDisabled(true);
    setBtn2Disabled(true);
    setShowSpinner(true);
    setStockCharts([]);

    const charts = await fetchStockChartsData(false);
    setStockCharts(charts);

    setShowSpinner(false);
    setBtnDisabled(false);
    setBtn2Disabled(false);
    setShowSuccessAlert(false);
    setShowBtn(charts.length > 0);
  };

  const predictClick = async (e) => {
    e.preventDefault();
    setBtn2Disabled(true);
    setShowSpinner2(true);
    setStockCharts([]);

    const charts = await fetchStockChartsData(true);
    setStockCharts(charts);

    setShowSpinner2(false);
    setBtn2Disabled(false);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const trackPayload = {
      Keyword: selectedKeyword,
      Industries: selectedCategories.map((item) => item.value),
    };
    try {
      await api.post(`${API_BASE_URL}/api/track-create/`, trackPayload);
      setShowSuccessAlert(true);
    } catch (err) {
      console.error("追蹤失敗:", err);
      alert("追蹤失敗，請確認是否已登入或稍後再試！");
    }
  };

  useEffect(() => {
    setBtnDisabled(selectedCategories.length === 0);
  }, [selectedCategories]);

  return (
    <div>
      {/* Hero Header */}
      <div className="hero-header">
        <Container>
          <div className="hero-pill">
            <span style={{ fontSize: "0.95rem" }}>⚡</span>
            即時熱搜趨勢 &middot; NLP概念股智能推薦
          </div>
          <h1 className="hero-title">網路熱搜與概念股關聯分析</h1>
          <p className="hero-desc">
            自動串接 Google Trends 熱搜話題與即時新聞，經由自然語言斷詞（NLP）比對概念股特徵庫，
            動態呈現歷史股價走勢與時間序列預測。
          </p>
        </Container>
      </div>

      <Container className="pb-5">
        {/* Filter Control Card */}
        <div className="filter-card">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <div className="step-label">
                <span className="step-number">1</span>
                <span>熱搜關鍵字</span>
              </div>
              <Select
                styles={customSelectStyles}
                options={keywords}
                onChange={handleChange1}
                placeholder="請選擇關鍵字"
                isDisabled={keywordDisabled}
              />
            </Col>

            <Col md={3}>
              <div className="step-label">
                <span className="step-number">2</span>
                <span>市場類別</span>
              </div>
              <Select
                styles={customSelectStyles}
                options={nations}
                onChange={handleChange2}
                placeholder="請選擇股市"
                isDisabled={nationDisabled}
                isLoading={nationLoading}
                value={selectedNation}
              />
            </Col>

            <Col md={4}>
              <div className="step-label">
                <span className="step-number">3</span>
                <span>關聯產業（最多 3 項）</span>
              </div>
              <Select
                styles={customSelectStyles}
                components={animatedComponents}
                onChange={(item) => setSelectedCategories(item || [])}
                isMulti
                options={categories}
                placeholder="請選擇關聯產業類別"
                isDisabled={categoryDisabled}
                isLoading={categoryLoading}
                isOptionDisabled={() => selectedCategories.length >= 3}
                value={selectedCategories}
              />
            </Col>

            <Col md={2} className="d-grid">
              <Button
                className="btn-trend-primary"
                disabled={btnDisabled || showSpinner}
                onClick={!btnDisabled ? handleSelect : null}
              >
                {showSpinner ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <span>📈 分析走勢</span>
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Action Toolbar (When Charts are ready) */}
        {showBtn && stockCharts.length > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm border mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle p-2">
                🎯 當前話題：<strong>{selectedKeyword}</strong>
              </span>
              <span className="text-muted small d-none d-md-inline">
                已載入 {stockCharts.length} 個產業類別圖表
              </span>
            </div>

            <div className="d-flex gap-2 mt-2 mt-sm-0">
              {user ? (
                <Button
                  variant="success"
                  className="btn-trend-primary"
                  disabled={btn2Disabled}
                  onClick={handleTrackSubmit}
                  size="sm"
                >
                  ⭐ 加入追蹤清單
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/Login"
                  variant="outline-secondary"
                  size="sm"
                >
                  登入以加入追蹤
                </Button>
              )}

              <Button
                className="btn-trend-outline"
                disabled={btn2Disabled || showSpinner2}
                onClick={predictClick}
                size="sm"
              >
                {showSpinner2 ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>運算預測中...</span>
                  </>
                ) : (
                  <>
                    <span>🔮 股價走勢預測</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        <Alert
          variant="success"
          show={showSuccessAlert}
          onClose={() => setShowSuccessAlert(false)}
          dismissible
          className="shadow-sm border-0 mb-4"
        >
          <div className="d-flex align-items-center">
            <span className="me-2 fs-5">🎉</span>
            <div>
              <strong>追蹤成功！</strong> 已將「{selectedKeyword}」標的加入個人自訂追蹤清單。
              前往{" "}
              <Alert.Link as={Link} to="/Tracks" className="fw-bold text-decoration-underline">
                我的追蹤清單
              </Alert.Link>{" "}
              觀測長期時間序列變化。
            </div>
          </div>
        </Alert>

        {/* Charts or Empty / Feature Overview */}
        {stockCharts.length > 0 ? (
          <div>
            {stockCharts.map((chartItem, idx) => (
              <div key={idx} className="chart-card">
                <div className="chart-header">
                  <h3 className="category-title">
                    <span style={{ color: "#10b981" }}>●</span>
                    產業類別：{chartItem.categoryName}
                  </h3>
                  <span className="category-tag">
                    {chartItem.chartData.datasets.length} 檔龍頭標的
                  </span>
                </div>
                <LineChart chartData={chartItem.chartData} />
              </div>
            ))}
          </div>
        ) : showSpinner || showSpinner2 ? (
          <div className="text-center py-5 bg-white rounded-3 border shadow-sm my-4">
            <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
            <h5 className="mt-4 text-dark fw-bold">巨量金融與語意資料運算中</h5>
            <p className="text-muted small">
              正在彙整新聞文本斷詞權重、檢索 Yahoo Finance 歷史股價並繪製圖表中，請稍候...
            </p>
          </div>
        ) : (
          <div>
            {/* Feature Highlights Grid */}
            <Row className="g-4 my-2">
              <Col md={4}>
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-green">🔥</div>
                  <h4 className="feature-title">每日焦點熱搜分析</h4>
                  <p className="feature-text">
                    自動抓取 Google Trends 最新每日熱門話題，內建高效快取機制，實時捕捉市場大眾最高關注焦點。
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-blue">🧠</div>
                  <h4 className="feature-title">NLP 語意斷詞概念媒合</h4>
                  <p className="feature-text">
                    透過 Jieba 中文自然語言分詞模型比對產業特徵庫，智慧識別受話題影響之概念類別與台/美龍頭股。
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-purple">📈</div>
                  <h4 className="feature-title">時間序列股價預測</h4>
                  <p className="feature-text">
                    整合 Yahoo Finance 歷史價量資訊，以滑動視窗移動平均模型（Moving Average）輔助研判未來趨勢。
                  </p>
                </div>
              </Col>
            </Row>

            {/* Quick guide card */}
            <Card className="border-0 shadow-sm mt-4 bg-light">
              <Card.Body className="p-4 text-center">
                <h5 className="fw-bold text-dark mb-2">💡 快速開始探索</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                  請於上方<strong>步驟 1</strong>下拉選單挑選當前感興趣的熱門關鍵字，接著選擇所屬市場與關聯產業，即可一鍵繪製概念股互動圖表！
                </p>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Keywords;
