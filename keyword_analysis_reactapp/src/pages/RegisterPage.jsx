import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import "./layout/layout.scss";
import Card from "react-bootstrap/Card";

const RegisterPage = () => {
  let { registerUser } = useContext(AuthContext);

  return (
    <div className="backgroundColor pt-4">
      <Container className="p-5 d-flex justify-content-center">
        <Card
          bg={"dark"}
          key={"dark"}
          text={"white"}
          style={{ width: "25rem" }}
          className="mb-2"
        >
          <Card.Header>註冊</Card.Header>
          <Card.Body>
            <Form onSubmit={registerUser}>
              <Form.Group className="m-3">
                <Form.Label>帳號</Form.Label>
                <Form.Control placeholder="請輸入姓名" name="username" />
              </Form.Group>

              <Form.Group className="m-3">
                <Form.Label>信箱</Form.Label>
                <Form.Control placeholder="請輸入信箱" name="email" />
              </Form.Group>

              <Form.Group className="m-3">
                <Form.Label>密碼</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="請輸入密碼"
                  name="password"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="m-3">
                註冊
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterPage;
