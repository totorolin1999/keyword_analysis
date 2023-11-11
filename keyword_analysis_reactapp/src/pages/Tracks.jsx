import useAxios from "../utils/useAxios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const Tracks = () => {
  const [tracks, setTracks] = useState([]);

  let api = useAxios();

  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const res = await api.get("http://127.0.0.1:8000/api/track-list/");
        setTracks(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllTracks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete("http://127.0.0.1:8000/api/track-delete/" + id);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Row xs={1} md={3} className="g-4">
        {tracks.map((track, idx) => (
          <Col key={idx}>
            <Card border="info" bg="Light" text="dark">
              <Card.Body>
                <Card.Title>{track.Keyword}</Card.Title>
                <Card.Text>
                  {track.Industries.map((industry, index) => (
                    <span key={index}>{industry.Name}&nbsp;</span>
                  ))}
                </Card.Text>
                <Card.Text>
                  {track.Times.map((time, index) => (
                    <span key={index}>{time.Date}&nbsp;</span>
                  ))}
                </Card.Text>
                <Button
                  variant="primary"
                  as={Link}
                  to={`/Track/${track.Track_ID}`}
                  className="me-2"
                >
                  查看股價走勢
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(track.Track_ID)}
                >
                  刪除
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Tracks;
