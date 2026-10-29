import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const RegisterPage = () => {
  const { registerUser } = useContext(AuthContext);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📈</div>
          <h2 className="auth-title">註冊新帳號</h2>
          <p className="auth-subtitle">加入 TrendStock 立即開始打造個人投資概念股儀表板</p>
        </div>

        <div className="auth-body">
          <Form onSubmit={registerUser}>
            <Form.Group className="mb-3">
              <Form.Label>使用者帳號</Form.Label>
              <Form.Control
                type="text"
                placeholder="設定您的帳號名稱"
                name="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>電子信箱</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@domain.com"
                name="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>帳號密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="請輸入安全密碼"
                name="password"
                required
              />
            </Form.Group>

            <Button type="submit" className="btn-trend-primary w-100 py-2">
              建立帳號
            </Button>
          </Form>
        </div>

        <div className="auth-footer">
          已經有帳號了嗎？{" "}
          <Link to="/Login">點此直接登入 &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
