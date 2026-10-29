import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Footer = () => {
  return (
    <footer className="trend-footer">
      <Container>
        <Row className="gy-4">
          <Col lg={6} md={12}>
            <div className="footer-brand">
              <span>📈 TrendStock</span>
              <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "normal" }}>
                概念股趨勢分析系統
              </span>
            </div>
            <p className="footer-desc">
              結合 Google Trends 即時搜尋趨勢、即時新聞爬蟲、Jieba 中文自然語言斷詞（NLP）與 Yahoo Finance 歷史股價數據，提供市場概念股關聯分析與時間序列預測。
            </p>
            <div>
              <span className="tech-badge">Python 3.9+</span>
              <span className="tech-badge">Django REST Framework</span>
              <span className="tech-badge">React 18</span>
              <span className="tech-badge">Chart.js</span>
              <span className="tech-badge">Yahoo Finance</span>
            </div>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-white fw-bold mb-3">系統功能</h6>
            <ul className="list-unstyled text-muted" style={{ fontSize: "0.9rem", lineHeight: "2" }}>
              <li>🔥 每日焦點熱搜話題</li>
              <li>🌐 台股 / 美股市場媒合</li>
              <li>📊 概念類股走勢繪製</li>
              <li>🔮 移動平均趨勢預測</li>
              <li>⭐ 會員個人化自訂追蹤</li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-white fw-bold mb-3">聲明與支援</h6>
            <p className="footer-disclaimer">
              * 本系統所有金融股價分析與預測模型僅供學術研究與技術展示用途，不構成任何商業投資建議或買賣推薦。
            </p>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted" style={{ fontSize: "0.85rem" }}>
          <div>&copy; {new Date().getFullYear()} TrendStock System. All rights reserved.</div>
          <div className="mt-2 mt-sm-0">
            Powered by Totoro Lin
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
