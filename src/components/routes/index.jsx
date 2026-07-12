import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../../pages/home/home";
import Elonlar from "../../pages/elonlar/elonlar";
import Sevimli from "../../pages/sevimli/sevimli";
import Xizmatlar from "../../pages/xizmatlar/xizmatlar";
import Yordam from "../../pages/yordam/yordam";
import ElonBerish from "../../pages/elon-berish/elon-berish";
import Profile from "../../pages/profile/profile";
import ElonDetails from "../../pages/elon-details/elon-details";
import Notfonud from "../NotFound/notfound";

function Index() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/elonlar" element={<Elonlar />} />
        <Route path="/sevimli" element={<Sevimli />} />
        <Route path="/xizmatlar" element={<Xizmatlar />} />
        <Route path="/yordam" element={<Yordam />} />
        <Route path="/elon-berish" element={<ElonBerish />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/elon/:id" element={<ElonDetails />} />
        <Route path="*" element={<Notfonud />} />
      </Routes>
    </>
  );
}

export default Index;
