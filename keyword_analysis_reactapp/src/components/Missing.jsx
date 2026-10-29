import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

const Missing = () => {
  return (
    <Container className="py-5 text-center">
      <div className="py-5 bg-white rounded-3 border shadow-sm my-4 p-5 mx-auto" style={{ maxWidth: "540px" }}>
        <div style={{ fontSize: "4rem" }} className="mb-3">🧭</div>
        <h2 className="fw-bold text-dark mb-2">404 - 找不到此頁面</h2>
        <p className="text-muted mb-4">
          您所尋找的頁面不存在或已被移除。請確認網址是否正確，或返回首頁探索熱門概念股。
        </p>
        <Button as={Link} to="/" className="btn-trend-primary">
          返回系統首頁 &rarr;
        </Button>
      </div>
    </Container>
  );
};

export default Missing;
