import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import queryString from "query-string";
import LineChart from "../components/LineChart";
import Button from "react-bootstrap/Button";

const Keywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [stockData, setStockData] = useState(null);

  const animatedComponents = makeAnimated();

  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);

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
    setLoading(true);
    const fetchCategories = async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/category-list?keyword=${selectedOption.value}`
      );
      setSelectedKeyword(selectedOption.value);
      setCategories(res.data);
      setIsDisabled(false);
      if (selectedCategories.length === 0) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    };
    fetchCategories();
  };

  const handleSelect = () => {
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
        datasets: res.data.map((item) => ({
          label: item.name,
          data: item.close,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        })),
      });
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
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [selectedCategories]);

  return (
    <div>
      <h1>Keywords</h1>
      <Button variant="secondary" as={Link} to="/Tracks">
        所有追蹤
      </Button>
      <Select
        options={keywords}
        onChange={handleChange}
        placeholder="請先選擇關鍵字（必選）"
      />
      <Select
        components={animatedComponents}
        onChange={(item) => setSelectedCategories(item)}
        isMulti
        options={categories}
        placeholder="選擇類別（必選）"
        isDisabled={isDisabled}
      />
      {/* <button onClick={handleSelect}>取得股價走勢</button> */}
      <Button
        variant="primary"
        disabled={isLoading}
        onClick={!isLoading ? handleSelect : null}
      >
        {isLoading ? "股價走勢（先選擇類別）" : "取得股價走勢"}
      </Button>
      <div>
        {stockData ? (
          <>
            <LineChart chartData={stockData} />
            <Button variant="primary" onClick={handleClick}>
              追蹤股價走勢
            </Button>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default Keywords;
