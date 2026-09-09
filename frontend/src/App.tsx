 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIssue />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;