import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "./client/Client";
import "./global.css";
import Header from "./components/Header/Header";
import Backlog from "./components/Backlog/Backlog";
import TaskPopup from "./components/TaskPopup/TaskPopup";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default function App() {

  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {

    (async () => {
     
      const client = new Client();
      await client.initialize();
      setClient(client);
      
    })();

  }, []);

  return client ? (
    <>
    
      <TaskPopup task={null} />
      <Header />
      <Backlog client={client} />
    </>
  ) : null;

}