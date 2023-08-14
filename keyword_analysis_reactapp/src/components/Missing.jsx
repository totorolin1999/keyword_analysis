import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";

const Missing = () => {
  return (
    <Container>
      <Card className="mt-5">
        <Card.Header>找不到網頁</Card.Header>
        <Card.Body>
          <Card.Title>本網站並沒有此頁面</Card.Title>
          <Card.Text>
            您是否要回到首頁？
          </Card.Text>
          <Button variant="primary" as={Link} to="/">
            回到首頁
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Missing;