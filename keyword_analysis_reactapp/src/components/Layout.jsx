import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "./footer/Footer";

const Layout = () => {
  return (
    <div className="app-wrapper">
      <UserNavbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
