import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Public from "./views/Public";
import TicketInfo from "./views/TicketInfo";
const root = createRoot(document.getElementById("root"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="/ticketInfo/details" element={<TicketInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
