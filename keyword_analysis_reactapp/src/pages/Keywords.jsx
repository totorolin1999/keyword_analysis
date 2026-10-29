import useAxios from "../utils/useAxios";
import React, { useContext, useEffect, useState, useMemo } from "react";
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

// 預設專業調色盤
const CHART_COLORS = [
  { border: "rgba(54, 162, 235, 1)", bg: "rgba(54, 162, 235, 0.2)" },
  { border: "rgba(255, 99, 132, 1)", bg: "rgba(255, 99, 132, 0.2)" },
  { border: "rgba(75, 192, 192, 1)", bg: "rgba(75, 192, 192, 0.2)" },
  { border: "rgba(255, 159, 64, 1)", bg: "rgba(255, 159, 64, 0.2)" },
  { border: "rgba(153, 102, 255, 1)", bg: "rgba(153, 102, 255, 0.2)" },
];

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

  const imageSrc = `${API_BASE_URL}/media/image1.svg`;

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

  // 封裝統一的抓取個股資料與建構 Chart.js 格式
  const fetchStockChartsData = async (isPredict = false) => {
    const charts = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/stock-chart/?category=${selectedCategories[i].value}${isPredict ? '&predict=true' : ''}`
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
                };
              }),
            }
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
    <Container className="py-5">
      <Row className="mb-3">
        <Col md={3} className="mb-3 mb-md-0">
          <Select
            options={keywords}
            onChange={handleChange1}
            placeholder="請選擇關鍵字"
            isDisabled={keywordDisabled}
          />
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Select
            options={nations}
            onChange={handleChange2}
            placeholder="請選擇股市類別"
            isDisabled={nationDisabled}
            isLoading={nationLoading}
            value={selectedNation}
          />
        </Col>
        <Col md={6}>
          <Select
            components={animatedComponents}
            onChange={(item) => setSelectedCategories(item || [])}
            isMulti
            options={categories}
            placeholder="選擇產業類別（最多 3 項）"
            isDisabled={categoryDisabled}
            isLoading={categoryLoading}
            isOptionDisabled={() => selectedCategories.length >= 3}
            value={selectedCategories}
          />
        </Col>
      </Row>

      <Button
        variant="success"
        disabled={btnDisabled}
        onClick={!btnDisabled ? handleSelect : null}
      >
        {showSpinner && (
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-1"
          />
        )}
        取得類股走勢
      </Button>

      {stockCharts.length > 0 ? (
        stockCharts.map((chartItem, idx) => (
          <div key={idx} className={idx > 0 ? "mt-5" : "mt-4"}>
            <h5 className="text-muted mb-3">產業：{chartItem.categoryName}</h5>
            <LineChart chartData={chartItem.chartData} />
          </div>
        ))
      ) : (
        <Row className="justify-content-md-center">
          {showSpinner || showSpinner2 ? (
            <Card style={{ width: "28rem" }} className="my-5 text-center">
              <Card.Img variant="top" src={imageSrc} />
              <Card.Body>
                <Card.Title>資料分析中，請稍後...</Card.Title>
                <Spinner animation="border" variant="success" className="mt-3" />
              </Card.Body>
            </Card>
          ) : (
            <Card
              bg="success"
              text="white"
              style={{ width: "32rem" }}
              className="my-5 shadow-sm"
            >
              <Card.Header className="fw-bold">系統特色與介紹</Card.Header>
              <Card.Body>
                <Card.Title>網路熱搜與概念股即時關聯分析系統</Card.Title>
                <Card.Text style={{ lineHeight: "1.7" }}>
                  本系統結合 Google 趨勢與即時新聞斷詞技術（NLP），精準媒合關注話題與對應市場（台股、美股）之概念龍頭股。透過時間序列移動平均（MA）預測未來走勢，輔助投資評估與話題追蹤。會員可將感興趣標的加入持續追蹤清單，觀測時間軸推移下的趨勢變化。
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Row>
      )}

      {showBtn && (
        <div className="my-4 text-center">
          {user && (
            <Button
              variant="success"
              disabled={btn2Disabled}
              onClick={handleTrackSubmit}
              className="me-2"
            >
              持續追蹤
            </Button>
          )}
          <Button
            variant="outline-success"
            disabled={btn2Disabled}
            onClick={predictClick}
          >
            預測股價走勢
            {showSpinner2 && (
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
                className="ms-1"
              />
            )}
          </Button>
        </div>
      )}

      <Alert key="success" variant="success" show={showSuccessAlert} className="mt-4">
        已成功加入追蹤清單！前往{" "}
        <Alert.Link as={Link} to="/Tracks">
          我的追蹤清單
        </Alert.Link>{" "}
        查看詳細變化。
      </Alert>
    </Container>
  );
};

export default Keywords;
