import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import AuthContext from "../context/AuthContext";

const UserNavbar = () => {
  let { user, logoutUser } = useContext(AuthContext);
  return (
    <Navbar expand="lg" className="backgroundColor" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          熱搜字的股市觀察系統
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        {user ? (
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/Tracks">
                所有追蹤
              </Nav.Link>
            </Nav>
            <Nav className="justify-content-end">
              {/* <Nav.Link as={Link} to="/Tracks">
                登出
              </Nav.Link> */}
              <Navbar.Text>目前身分為管理員：{user.username}</Navbar.Text>
              <Nav>
                <Nav.Link onClick={logoutUser}>登出</Nav.Link>
              </Nav>
            </Nav>
          </Navbar.Collapse>
        ) : (
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end">
              <Nav.Link as={Link} to="/Tracks">
                登入
              </Nav.Link>
            </Nav>
            <Nav className="justify-content-end">
              <Nav.Link as={Link} to="/Register">
                註冊
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
