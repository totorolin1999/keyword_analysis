import useAxios from "../utils/useAxios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ReactPaginate from "react-paginate";
import "./pagination/pagination.scss";
import Container from "react-bootstrap/Container";

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;

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

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(tracks.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(tracks.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, tracks]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % tracks.length;
    setItemOffset(newOffset);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("http://127.0.0.1:8000/api/track-delete/" + id);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="backgroundColor">
      <Container className="py-5">
        {tracks.length ? (
          <div>
            <Row xs={1} md={3} className="g-4">
              {currentItems.map((track, idx) => (
                <Col key={idx}>
                  <Card border="light" bg="dark" text="white">
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
                        variant="success"
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
            <ReactPaginate
              breakLabel="..."
              nextLabel="下一頁 >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              pageCount={pageCount}
              previousLabel="< 上一頁"
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-num"
              nextLinkClassName="page-num"
              activeLinkClassName="active"
            />
          </div>
        ) : (
          <Row className="justify-content-md-center">
            <Card style={{ width: "23rem" }}>
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </Card.Text>
                {/* <Button variant="primary">Go somewhere</Button> */}
              </Card.Body>
              <Card.Img variant="top" src="../../images/1549922167.svg" />
            </Card>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Tracks;
