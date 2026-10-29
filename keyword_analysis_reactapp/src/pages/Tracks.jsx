import useAxios from "../utils/useAxios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import ReactPaginate from "react-paginate";
import Container from "react-bootstrap/Container";
import API_BASE_URL from "../apiConfig";

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setTracks((prevTracks) => prevTracks.filter((track) => track.Track_ID !== id));
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗，請稍後再試！");
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="py-5">
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="mt-3 text-dark fw-bold">載入追蹤清單中...</h5>
          <p className="text-muted small">正在檢索您的個人投資關注項目</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-4 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">⭐ 我的追蹤清單</h2>
          <p className="text-muted mb-0">
            觀測您所收藏的熱搜概念股標的，點擊即可追蹤跨時間序列的股價變化。共{" "}
            <strong>{tracks.length}</strong> 個項目
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <Button as={Link} to="/" className="btn-trend-primary" size="sm">
            ➕ 探索新話題
          </Button>
        </div>
      </div>

      {tracks.length > 0 ? (
        <div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {currentItems.map((track) => (
              <Col key={track.Track_ID}>
                <div className="trend-track-card">
                  <div className="card-header-custom d-flex justify-content-between align-items-center">
                    <h5 className="keyword-title">
                      🎯 {track.Keyword}
                    </h5>
                    <span className="badge bg-light text-secondary border">
                      #{track.Track_ID}
                    </span>
                  </div>

                  <div className="card-body-custom">
                    <div className="mb-3">
                      <div className="section-subtitle">關聯產業標的</div>
                      <div>
                        {track.Industries && track.Industries.length > 0 ? (
                          track.Industries.map((industry, index) => (
                            <span key={index} className="badge-chip">
                              {industry.Name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">暫無產業關聯</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="section-subtitle">追蹤打卡紀錄點</div>
                      <div>
                        {track.Times && track.Times.length > 0 ? (
                          track.Times.map((time, index) => (
                            <span key={index} className="date-chip">
                              📅 {time.Date}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">尚無紀錄</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer-custom">
                    <Button
                      variant="success"
                      as={Link}
                      to={`/Track/${track.Track_ID}`}
                      size="sm"
                      className="btn-trend-primary py-1 px-3"
                      style={{ fontSize: "0.85rem" }}
                    >
                      查看股價走勢 &rarr;
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(track.Track_ID)}
                      style={{ borderRadius: "8px", fontSize: "0.82rem" }}
                    >
                      刪除
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {pageCount > 1 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel="下一頁 &rarr;"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              pageCount={pageCount}
              previousLabel="&larr; 上一頁"
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
        <div className="text-center py-5 bg-white rounded-3 border shadow-sm my-4 p-5">
          <div style={{ fontSize: "3.5rem" }} className="mb-3">📋</div>
          <h4 className="fw-bold text-dark">目前尚無追蹤紀錄</h4>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "450px" }}>
            您目前還沒有建立任何概念股追蹤！前往首頁探索最受關注的熱門關鍵字與龍頭概念股，一鍵加入自訂清單。
          </p>
          <Button as={Link} to="/" className="btn-trend-primary">
            立即前往首頁探索 📈
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Tracks;
