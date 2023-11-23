import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "./footer/Footer";

const Layout = () => {
  return (
    <main className="App">
      <UserNavbar />
      <Outlet />
      <Footer />
    </main>
  );
};

export default Layout;
