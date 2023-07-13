import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import queryString from "query-string";
import TrackChart from "../components/TrackChart";
import Button from "react-bootstrap/Button";

const Track = () => {
  const [track, setTrack] = useState({
    Track_ID: null,
    Industries: [],
    Times: [],
    Keyword: "",
  });
  const [stockData, setStockData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const trackId = location.pathname.split("/")[2];

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const res = await axios.get(
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
            `http://127.0.0.1:8000/api/stock-chart?time=${timeQuery}&${categoriesQuery}`
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
      } catch (err) {
        console.log(err);
      }
    };
    fetchTrack();
  }, []);

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
      <p>{track.Keyword}</p>
      <p>
        {track.Industries.map((industry, index) => (
          <span key={index}>{industry.Name}&nbsp;</span>
        ))}
      </p>
      <div>
        {stockData ? (
          <>
            <TrackChart chartData={stockData} trackData={track} />
            <Button variant="primary" onClick={handleClick}>
              持續追蹤
            </Button>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

export default Track;
