import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";
// import Footer from "./footer/Footer";
import Container from "react-bootstrap/Container";

const Layout = () => {
  return (
    <main className="App">
      <UserNavbar />
      <Container className="my-5">
        <Outlet />
      </Container>
      {/* <Footer /> */}
    </main>
  );
};

export default Layout;
