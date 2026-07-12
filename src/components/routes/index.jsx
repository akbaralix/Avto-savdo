import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../../pages/home/home";
import Notfonud from "../NotFound/notfound";

function Index() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="*" element={<Notfonud />} />
      </Routes>
    </>
  );
}

export default Index;
