import useAxios from "../utils/useAxios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import queryString from "query-string";
import LineChart from "../components/LineChart";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

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
  const [stockData, setStockData] = useState(null);
  const [stockData1, setStockData1] = useState(null);
  const [stockData2, setStockData2] = useState(null);

  const animatedComponents = makeAnimated();

  // const navigate = useNavigate();

  const [btnDisabled, setbtnDisabled] = useState(true);
  const [nationLoading, setNationLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinner2, setShowSpinner2] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  let api = useAxios();

  useEffect(() => {
    const fetchAllKeywords = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/keyword-list/");
        setKeywords(res.data);
        setKeywordDisabled(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllKeywords();
  }, []);

  const handleChange1 = (selectedOption) => {
    setNationDisabled(true);
    setSelectedNation(null);
    setNationLoading(true);
    setCategoryDisabled(true);
    setSelectedCategories([]);
    setSelectedKeyword(selectedOption.value);
    const fetchNations = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/nation-list?keyword=${selectedOption.value}`
        );
        setNations(res.data);
        setNationDisabled(false);
        setNationLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchNations();
  };

  const handleChange2 = (selectedOption) => {
    setSelectedNation(selectedOption);
    setCategoryDisabled(true);
    setbtnDisabled(true);
    setSelectedCategories([]);
    setCategoryLoading(true);
    const fetchCategories = async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/category-list?keyword=${selectedKeyword}&nation=${selectedOption.value}`
      );
      setCategories(res.data);
      setCategoryDisabled(false);
      setCategoryLoading(false);
    };
    fetchCategories();
  };

  const handleSelect = () => {
    setShowSpinner(true);
    setStockData(null);
    setStockData1(null);
    setStockData2(null);
    const fetchStockData = async () => {
      for (var i = 0; i < selectedCategories.length; i++) {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/stock-chart?category=${selectedCategories[i].value}`
        );
        if (i === 0) {
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
        } else if (i === 1) {
          setStockData1({
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
        } else if (i === 2) {
          setStockData2({
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
        }
      }
      setShowSpinner(false);
      setShow(false);
      setShowBtn(true);
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
      await api.post("http://127.0.0.1:8000/api/track-create/", track);
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

  const predictClick = async (e) => {
    e.preventDefault();
    setShowSpinner2(true);
    setStockData(null);
    setStockData1(null);
    setStockData2(null);
    try {
      const fetchStockData = async () => {
        for (var i = 0; i < selectedCategories.length; i++) {
          const res = await axios.get(
            `http://127.0.0.1:8000/api/stock-chart?category=${
              selectedCategories[i].value
            }&predict=${true}`
          );
          if (i === 0) {
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
          } else if (i === 1) {
            setStockData1({
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
          } else if (i === 2) {
            setStockData2({
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
          }
        }
        setShowSpinner2(false);
      };
      fetchStockData();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-5">
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
            onChange={(item) => setSelectedCategories(item)}
            isMulti
            options={categories}
            placeholder="選擇產業類別（可複選）"
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
      <Alert key="success" variant="success" show={show} className="mt-4">
        您已追蹤成功，前往
        <Alert.Link as={Link} to="/Tracks">
          所有追蹤
        </Alert.Link>
        查看
      </Alert>
      {stockData ? (
        <div>
          <LineChart chartData={stockData} />
        </div>
      ) : (
        <div></div>
      )}
      {stockData1 ? (
        <div className="mt-5">
          <LineChart chartData={stockData1} />
        </div>
      ) : (
        <div></div>
      )}
      {stockData2 ? (
        <div className="mt-5">
          <LineChart chartData={stockData2} />
        </div>
      ) : (
        <div></div>
      )}
      {showBtn ? (
        <div className="my-4 text-center">
          <Button variant="success" onClick={handleClick}>
            持續追蹤
          </Button>{" "}
          <Button variant="outline-success" onClick={predictClick}>
            預測股價
            {showSpinner2 ? (
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
          </Button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Keywords;
