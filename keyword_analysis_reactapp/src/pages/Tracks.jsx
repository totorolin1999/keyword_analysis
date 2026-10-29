import useAxios from "../utils/useAxios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import ReactPaginate from "react-paginate";
import "./pagination/pagination.scss";
import Container from "react-bootstrap/Container";
import API_BASE_URL from "../apiConfig";

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 3;

  const imageSrc = `${API_BASE_URL}/media/image2.svg`;
  const api = useAxios();

  const fetchAllTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE_URL}/api/track-list/`);
      setTracks(res.data || []);
    } catch (err) {
      console.error("無法取得追蹤清單:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTracks();
  }, []);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(tracks.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(tracks.length / itemsPerPage) || 0);
  }, [itemOffset, itemsPerPage, tracks]);

  const handlePageClick = (event) => {
    if (tracks.length === 0) return;
    const newOffset = (event.selected * itemsPerPage) % tracks.length;
    setItemOffset(newOffset);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("確定要刪除這筆追蹤紀錄嗎？")) {
      return;
    }
    try {
      await api.delete(`${API_BASE_URL}/api/track-delete/${id}/`);
      // 以 React State 更新，不強制 reload 頁面
      setTracks((prevTracks) => prevTracks.filter((track) => track.Track_ID !== id));
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗，請稍後再試！");
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">正在載入您的追蹤清單...</p>
      </Container>
    );
  }

  return (
    <div className="backgroundColor">
      <Container className="py-5">
        {tracks.length > 0 ? (
          <div>
            <Row xs={1} md={3} className="g-4 my-md-5">
              {currentItems.map((track) => (
                <Col key={track.Track_ID}>
                  <Card border="light" bg="dark" text="white" className="h-100 shadow-sm">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="border-bottom pb-2 text-success fw-bold">
                        {track.Keyword}
                      </Card.Title>
                      <Card.Text className="mb-2">
                        <strong className="text-light">關聯產業：</strong><br />
                        {track.Industries?.map((industry, index) => (
                          <span key={index} className="badge bg-secondary me-1 mt-1">
                            {industry.Name}
                          </span>
                        ))}
                      </Card.Text>
                      <Card.Text className="mt-auto mb-3">
                        <small className="text-muted">追蹤紀錄點：</small><br />
                        {track.Times?.map((time, index) => (
                          <span key={index} className="badge bg-dark border me-1 mt-1">
                            {time.Date}
                          </span>
                        ))}
                      </Card.Text>
                      <div className="d-flex justify-content-between mt-2">
                        <Button
                          variant="success"
                          as={Link}
                          to={`/Track/${track.Track_ID}`}
                          size="sm"
                        >
                          查看股價走勢
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(track.Track_ID)}
                        >
                          刪除
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {pageCount > 1 && (
              <ReactPaginate
                breakLabel="..."
                nextLabel="下一頁 >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="< 上一頁"
                renderOnZeroPageCount={null}
                containerClassName="pagination justify-content-center"
                pageLinkClassName="page-num"
                previousLinkClassName="page-num"
                nextLinkClassName="page-num"
                activeLinkClassName="active"
              />
            )}
          </div>
        ) : (
          <Row className="justify-content-md-center">
            <Card
              bg="success"
              text="white"
              style={{ width: "28rem" }}
              className="my-5 text-center shadow"
            >
              <Card.Img variant="top" src={imageSrc} />
              <Card.Body>
                <Card.Title className="fw-bold">目前無追蹤紀錄</Card.Title>
                <Card.Text>
                  您目前並沒有任何追蹤資訊，趕快前往首頁探索熱門關鍵字與概念股吧！
                </Card.Text>
                <Button variant="light" as={Link} to="/" className="text-success fw-bold">
                  前往探索
                </Button>
              </Card.Body>
            </Card>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Tracks;
