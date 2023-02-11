import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Client from "./client/Client";
import Backlog from "./components/Backlog/Backlog";
import IssueViewer from "./components/IssueViewer/IssueViewer";
import "./global.css";

export default function App() {

  const [client] = useState(new Client());

  return (
    <>
      <Routes>
        <Route path="/issues/:issueId" element={<Backlog client={client} />} />
        <Route path="/" element={<Backlog client={client} />} />
      </Routes>
    </>
  );

}