import React from "react";
import "./App.css";
import Navbar from "./pages/navbar/navbar.jsx";
import Index from "./components/routes/index.jsx";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Index />
    </div>
  );
}

export default App;
