import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Keywords from "./pages/Keywords";
import Tracks from "./pages/Tracks";
import Track from "./pages/Track";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "./components/Layout";
import Missing from "./components/Missing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route element={<LoginPage />} path="/Login" />
        <Route path="/" element={<Keywords />} />
        <Route path="*" element={<Missing />} />
        <Route element={<PrivateRoute />}>
          <Route element={<HomePage />} path="/Home" />
          <Route path="/Tracks" element={<Tracks />} />
          <Route path="/Track/:id" element={<Track />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
