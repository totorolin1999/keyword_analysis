import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import AuthContext from "../context/AuthContext";

const UserNavbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();

  return (
    <Navbar expand="lg" variant="dark" className="trend-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <span className="brand-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </span>
          <span>TrendStock</span>
          <span className="brand-sub d-none d-sm-inline">熱搜概念股觀察</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto ms-lg-3">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === "/" ? "active fw-bold text-white" : ""}
            >
              📊 趨勢分析
            </Nav.Link>
            {user && (
              <Nav.Link
                as={Link}
                to="/Tracks"
                className={location.pathname.startsWith("/Track") ? "active fw-bold text-white" : ""}
              >
                ⭐ 我的追蹤清單
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <>
                <div className="user-badge me-lg-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{user.username}</span>
                </div>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={logoutUser}
                  style={{ borderRadius: "8px", fontSize: "0.85rem", padding: "0.35rem 0.8rem" }}
                >
                  登出
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/Login"
                  className={location.pathname === "/Login" ? "active text-white" : ""}
                >
                  登入
                </Nav.Link>
                <Button
                  as={Link}
                  to="/Register"
                  variant="success"
                  size="sm"
                  className="btn-trend-primary"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                >
                  立即註冊
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
