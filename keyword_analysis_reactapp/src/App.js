import { BrowserRouter, Routes, Route } from "react-router-dom";
import Keywords from "./pages/Keywords";
import Tracks from "./pages/Tracks";
import Track from "./pages/Track";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "./components/Layout";
import Missing from "./components/Missing";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Keywords/>}/>
            <Route path="/Tracks" element={<Tracks/>}/>
            <Route path="/Track/:id" element={<Track/>}/>
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;