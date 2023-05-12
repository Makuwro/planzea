import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "./client/Client";
import "./global.css";
import Header from "./components/Header/Header";
import Backlog from "./components/Backlog/Backlog";
import TaskPopup from "./components/TaskPopup/TaskPopup";
import { BrowserRouter, Route, Routes, matchPath, useLocation } from "react-router-dom";
import Task from "./client/Task";

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

  const [task, setTask] = useState<Task | null>(null);
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState<boolean>(false);
  const location = useLocation();
  useEffect(() => {

    (async () => {

      const taskId = matchPath("/:username/tasks/:taskId", location.pathname)?.params.taskId;
      if (client && taskId) {

        setTask(await client.getTask(taskId));
        setIsTaskPopupOpen(true);

      } else {
        
        setIsTaskPopupOpen(false);

      }

    })();

  }, [client, location]);

  return client ? (
    <>
      {task ? <TaskPopup client={client} onUpdate={(newTask) => setTask(newTask)} task={task} isOpen={isTaskPopupOpen} onClose={() => setTask(null)} /> : null}
      <Header />
      <Routes>
        <Route path="/:username/tasks" element={<Backlog client={client} />} />
        <Route path="/:username/tasks/:taskId" element={<Backlog client={client} />} />
      </Routes>
    </>
  ) : null;

}