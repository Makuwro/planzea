import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "./client/Client";
import "./global.css";
import Header from "./components/Header/Header";
import Backlog from "./components/Backlog/Backlog";
import TaskPopup from "./components/TaskPopup/TaskPopup";
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate, useParams } from "react-router-dom";
import Task from "./client/Task";
import Project from "./client/Project";
import SettingsPage from "./components/SettingsPage/SettingsPage";
import HomePage from "./components/HomePage/HomePage";
import ProjectCreationPopup from "./components/ProjectCreationPopup/ProjectCreationPopup";
import LabelCreationPopup from "./components/LabelCreationPopup/LabelCreationPopup";

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

      const taskId = matchPath("/:username/projects/:projectId/tasks/:taskId", location.pathname)?.params.taskId;
      if (client && taskId) {

        setTask(await client.getTask(taskId));
        setIsTaskPopupOpen(true);

      } else {
        
        setIsTaskPopupOpen(false);

      }

    })();

  }, [client, location]);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("Planzea");
  return client ? (
    <>
      {task && currentProject ? <TaskPopup project={currentProject} client={client} onUpdate={(newTask) => setTask(newTask)} task={task} isOpen={isTaskPopupOpen} onClose={() => setTask(null)} /> : null}
      <LabelCreationPopup client={client} documentTitle={documentTitle} project={currentProject} setCurrentProject={setCurrentProject} />
      <ProjectCreationPopup client={client} documentTitle={documentTitle} />
      <Header />
      <Routes>
        <Route path="/:username" element={<Navigate to="/" />} />
        <Route path="/:username/projects" element={<Navigate to="/" />} />
        <Route path="/:username/projects/:projectId" element={<Navigate to={(() => {

          const params = matchPath("/:username/projects/:projectId", location.pathname)?.params;
          return params ? `/${params.username}/projects/${params.projectId}/tasks` : "/";

        })()} replace />} />
        <Route path="/:username/projects/:projectId/tasks" element={<Backlog client={client} setCurrentProject={(project) => setCurrentProject(project)} setDocumentTitle={setDocumentTitle} />} />
        <Route path="/:username/projects/:projectId/tasks/:taskId" element={<Backlog client={client} setCurrentProject={(project) => setCurrentProject(project)} setDocumentTitle={setDocumentTitle} />} />
        <Route path="/:username/projects/:projectId/settings" element={<SettingsPage client={client} project={currentProject} setCurrentProject={setCurrentProject} setDocumentTitle={setDocumentTitle} />} />
        <Route path="/" element={<HomePage client={client} setDocumentTitle={setDocumentTitle} />} />
      </Routes>
    </>
  ) : null;

}