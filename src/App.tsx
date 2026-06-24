import { Route, Routes } from "react-router-dom";
import ArticlePage from "./routes/ArticlePage";
import HomePage from "./routes/HomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
    </Routes>
  );
}
