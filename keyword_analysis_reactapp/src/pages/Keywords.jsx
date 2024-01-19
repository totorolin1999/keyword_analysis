import useAxios from "../utils/useAxios";
import React, { useContext } from "react";
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
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import AuthContext from "../context/AuthContext";
import API_BASE_URL from "../apiConfig";

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
  const [btn2Disabled, setbtn2Disabled] = useState(true);
  const [nationLoading, setNationLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinner2, setShowSpinner2] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const [imageSrc, setImageSrc] = useState("");

  let api = useAxios();

  let { user, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllKeywords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/keyword-list/`);
        setKeywords(res.data);
        setKeywordDisabled(false);
      } catch (err) {
        console.log(err);
      }
    };
    setImageSrc(`${API_BASE_URL}/media/image1.svg`);
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
          `${API_BASE_URL}/api/nation-list?keyword=${selectedOption.value}`
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
        `${API_BASE_URL}/api/category-list?keyword=${selectedKeyword}&nation=${selectedOption.value}`
      );
      setCategories(res.data);
      setCategoryDisabled(false);
      setCategoryLoading(false);
    };
    fetchCategories();
  };

  const handleSelect = () => {
    setbtnDisabled(true);
    setbtn2Disabled(true);
    setShowSpinner(true);
    setStockData(null);
    setStockData1(null);
    setStockData2(null);
    const fetchStockData = async () => {
      for (var i = 0; i < selectedCategories.length; i++) {
        const res = await axios.get(
          `${API_BASE_URL}/api/stock-chart?category=${selectedCategories[i].value}`
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
      setbtnDisabled(false);
      setbtn2Disabled(false);
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
      await api.post(`${API_BASE_URL}/api/track-create/`, track);
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
    setbtn2Disabled(true);
    setShowSpinner2(true);
    setStockData(null);
    setStockData1(null);
    setStockData2(null);
    try {
      const fetchStockData = async () => {
        for (var i = 0; i < selectedCategories.length; i++) {
          const res = await axios.get(
            `${API_BASE_URL}/api/stock-chart?category=${
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
        setbtn2Disabled(false);
      };
      fetchStockData();
    } catch (err) {
      console.log(err);
    }
  };

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
      {stockData ? (
        <div>
          <LineChart chartData={stockData} />
        </div>
      ) : (
        <Row className="justify-content-md-center">
          {showSpinner || showSpinner2 ? (
            <Card style={{ width: "28rem" }}>
              <Card.Img variant="top" src={imageSrc} />
              <Card.Body>
                <Card.Title>資料載入中，請稍後！</Card.Title>
                <Spinner animation="border" />
                {/* <Card.Text>
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </Card.Text> */}
              </Card.Body>
            </Card>
          ) : (
            <Card
              bg="success"
              text="white"
              style={{ width: "28rem" }}
              className="my-5"
            >
              <Card.Header>系統介紹</Card.Header>
              <Card.Body>
                <Card.Title>網路熱搜字的股市熱度觀察系統</Card.Title>
                <Card.Text>
                  本系統是基於網路關鍵字和類股的結合，以Web開發、網路爬蟲、資料分析、資料視覺化等技術建置而成，使用者可以透過平台即時掌握網路搜尋趨勢，並選擇欲關注的熱搜字。接著，系統會按照使用者選取的關鍵字，經由資料分析後，依各產業受該關鍵字影響之程度排序，提供使用者選擇。使用者選取欲關注的產業後，平台將會藉由資料視覺化呈現該關鍵字下特定產業的類股指數、龍頭股價格等，以及利用時間序列預測方法預測未來走勢，藉此讓使用者觀察關鍵字與產業之間的關聯性，並且判斷產業將來走向。同時，系統也會分析該關鍵字所適合關注的股市類別，使用者可依系統推薦或是自身目的如投資參考，選擇關注台股或是美股，觀察國內產業抑或國際產業所受的影響。使用者可以在平台上儲存其搜尋資訊，日後查看關鍵字下的產業變化、更新預測資訊，以及持續追蹤後續發展。
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Row>
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
          {user ? (
            <Button variant="success" disabled={btn2Disabled} onClick={handleClick}>
              持續追蹤
            </Button>
          ) : (
            <></>
          )}
          <Button variant="outline-success" disabled={btn2Disabled} onClick={predictClick}>
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
      <Alert key="success" variant="success" show={show} className="mt-4">
        您已追蹤成功，前往
        <Alert.Link as={Link} to="/Tracks">
          所有追蹤
        </Alert.Link>
        查看
      </Alert>
    </Container>
  );
};

export default Keywords;
