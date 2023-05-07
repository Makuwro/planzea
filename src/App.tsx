import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link, Location, matchPath, Route, Routes, useLocation } from "react-router-dom";
import Client from "./client/Client";
import Project from "./client/Project";
import "./global.css";
import Header from "./components/Header/Header";
import Backlog from "./components/Backlog/Backlog";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default function App() {

  const [client] = useState(new Client());

  return (
    <>
      <Header />
      <Backlog />
    </>
  );

}