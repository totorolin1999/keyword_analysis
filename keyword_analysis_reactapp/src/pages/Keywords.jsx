import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import queryString from "query-string";
import LineChart from "../components/LineChart";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

const Keywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [stockData, setStockData] = useState(null);

  const animatedComponents = makeAnimated();

  // const navigate = useNavigate();

  const [btnDisabled, setbtnDisabled] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const fetchAllKeywords = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/keyword-list/");
        setKeywords(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllKeywords();
  }, []);

  const handleChange = (selectedOption) => {
    setIsDisabled(true);
    setbtnDisabled(true);
    setLoading(true);
    const fetchCategories = async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/category-list?keyword=${selectedOption.value}`
      );
      setSelectedKeyword(selectedOption.value);
      setCategories(res.data);
      setIsDisabled(false);
      setLoading(false);
      if (selectedCategories.length === 0) {
        setbtnDisabled(true);
      } else {
        setbtnDisabled(false);
      }
    };
    fetchCategories();
  };

  const handleSelect = () => {
    setShowSpinner(true);
    const categoriesQuery = queryString.stringify(
      { categories: selectedCategories.map((item) => item.value) },
      { arrayFormat: "bracket-separator", arrayFormatSeparator: "|" }
    );
    const fetchStockData = async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/stock-chart?${categoriesQuery}`
      );
      setStockData({
        labels: res.data[0].date,
        datasets: res.data.map((item) => {
          const number1 = Math.floor(Math.random() * 256);
          const number2 = Math.floor(Math.random() * 256);
          const number3 = Math.floor(Math.random() * 256);
          const randomColor1 = `rgba(${number1}, ${number2}, ${number3})`;
          const randomColor2 = `rgba(${number1}, ${number2}, ${number3}, 0.5)`;

          return {
            label: item.name,
            data: item.close,
            borderColor: randomColor1,
            backgroundColor: randomColor2,
          };
        }),
      });
      setShowSpinner(false);
      setShow(false);
    };
    fetchStockData();
  };

  const handleClick = async (e) => {
    e.preventDefault();
    let track = {
      Keyword: selectedKeyword,
      Industries: selectedCategories.map((item) => item.value),
    };
    try {
      await axios.post("http://127.0.0.1:8000/api/track-create/", track);
      setShow(true);
      // navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setbtnDisabled(true);
    } else {
      setbtnDisabled(false);
    }
  }, [selectedCategories]);

  return (
    <>
      <Row className="mb-3">
        <Col md={6} className="mb-3 mb-md-0">
          <Select
            options={keywords}
            onChange={handleChange}
            placeholder="請先選擇關鍵字"
          />
        </Col>
        <Col md={6}>
          <Select
            components={animatedComponents}
            onChange={(item) => setSelectedCategories(item)}
            isMulti
            options={categories}
            placeholder="選擇產業類別（可複選）"
            isDisabled={isDisabled}
            isLoading={isLoading}
          />
        </Col>
      </Row>
      <Button
        variant="primary"
        disabled={btnDisabled}
        onClick={!btnDisabled ? handleSelect : null}
      >
        {showSpinner ? (
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        ) : (
          <></>
        )}
        取得類股走勢
      </Button>
      <div>
        {stockData ? (
          <>
            <Alert key="success" variant="success" show={show} className="mt-4">
              您已追蹤成功，前往
              <Alert.Link as={Link} to="/Tracks">
                所有追蹤
              </Alert.Link>
              查看
            </Alert>
            <LineChart chartData={stockData} />
            <div className="d-grid gap-2 mt-2">
              <Button variant="primary" onClick={handleClick} disabled={show}>
                {!show ? "追蹤股價走勢" : "您已追蹤股價走勢"}
              </Button>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default Keywords;
