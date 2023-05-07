import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link, Location, matchPath, Route, Routes, useLocation } from "react-router-dom";
import Client from "./client/Client";
import Project from "./client/Project";
import "./global.css";
import Header from "./components/Header/Header";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default function App() {

  const [client] = useState(new Client());

  return (
    <>
      <Header />
      <main>
        <section>
          <h1>You don't have any projects</h1>
          <p>Why don't we change that?</p>
          <button>Create project</button>
        </section>
      </main>
    </>
  );

}