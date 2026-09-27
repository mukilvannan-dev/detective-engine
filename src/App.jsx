import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage, CasesPage, CaseInvestigationPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/case/:id" element={<CaseInvestigationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;