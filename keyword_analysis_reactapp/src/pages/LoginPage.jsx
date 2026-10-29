import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const LoginPage = () => {
  const { loginUser } = useContext(AuthContext);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📈</div>
          <h2 className="auth-title">會員登入</h2>
          <p className="auth-subtitle">登入 TrendStock 存取個人自訂概念股追蹤清單</p>
        </div>

        <div className="auth-body">
          <Form onSubmit={loginUser}>
            <Form.Group className="mb-3">
              <Form.Label>使用者帳號</Form.Label>
              <Form.Control
                type="text"
                placeholder="請輸入您的帳號名稱"
                name="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>帳號密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="請輸入您的密碼"
                name="password"
                required
              />
            </Form.Group>

            <Button type="submit" className="btn-trend-primary w-100 py-2">
              登入系統
            </Button>
          </Form>
        </div>

        <div className="auth-footer">
          還沒有帳號嗎？{" "}
          <Link to="/Register">立即免費註冊 &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
