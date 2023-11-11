import useAxios from "../utils/useAxios";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import queryString from "query-string";
import TrackChart from "../components/TrackChart";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

const Track = () => {
  const [track, setTrack] = useState({
    Track_ID: null,
    Industries: [],
    Times: [],
    Keyword: "",
  });
  const [stockData, setStockData] = useState(null);
  const [predict, setPredict] = useState(false);

  const [show, setShow] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const trackId = location.pathname.split("/")[2];

  let api = useAxios();

  useEffect(() => {
    setShowSpinner(true);
    const fetchTrack = async () => {
      try {
        const res = await api.get(
          `http://127.0.0.1:8000/api/track-detail/${trackId}/`
        );
        setTrack(res.data);
        const timeQuery = res.data.Times[0].Date;
        const categoriesQuery = queryString.stringify(
          { categories: res.data.Industries.map((item) => item.Industry_ID) },
          { arrayFormat: "bracket-separator", arrayFormatSeparator: "|" }
        );
        const fetchStockData = async () => {
          const res = await axios.get(
            `http://127.0.0.1:8000/api/stock-chart?time=${timeQuery}&${categoriesQuery}&predict=${predict}`
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
        };
        fetchStockData();
      } catch (err) {
        console.log(err);
      }
    };
    fetchTrack();
  }, [predict]);

  const handleClick = async (e) => {
    e.preventDefault();
    const fetchNewTrack = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/track-time-create/${trackId}/`
        );
        alert(res.data.Message);
        // setTrack(res.data);
        // navigate(`/Tracks`);
        window.location.reload();
      } catch (err) {
        console.log(err);
      }
    };
    fetchNewTrack();
  };

  //   console.log(track);
  return (
    <>
      <Alert show={show} variant="success">
        <Alert.Heading>關鍵字：{track.Keyword}</Alert.Heading>
        <p>
          產業：
          {track.Industries.map((industry, index) => (
            <span key={index}>{industry.Name}&nbsp;</span>
          ))}
        </p>
        <p>
          追蹤時間：
          {track.Times.map((time, index) => (
            <span key={index}>{time.Date}&nbsp;</span>
          ))}
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => setShow(false)} variant="outline-success">
            關閉追蹤資訊
          </Button>
        </div>
      </Alert>

      {!show && <Button onClick={() => setShow(true)}>顯示追蹤資訊</Button>}
      <div>
        {stockData ? (
          <>
            <TrackChart chartData={stockData} trackData={track} />
            <div className="my-2 text-center">
              <Button variant="primary" size="lg" onClick={handleClick}>
                持續追蹤
              </Button>{" "}
              <Button variant="info" size="lg" onClick={() => setPredict(true)}>
                預測股價
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
              </Button>
            </div>
          </>
        ) : (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
      </div>
    </>
  );
};

export default Track;
