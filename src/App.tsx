import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "./client/Client";
import "./global.css";
import Header from "./components/Header/Header";
import Backlog from "./components/Backlog/Backlog";
import TaskPopup from "./components/TaskPopup/TaskPopup";
import { Navigate, Route, Routes, matchPath, useLocation } from "react-router-dom";
import Project from "./client/Project";
import SettingsPage from "./components/SettingsPage/SettingsPage";
import HomePage from "./components/HomePage/HomePage";
import ProjectCreationPopup from "./components/ProjectCreationPopup/ProjectCreationPopup";
import LabelCreationPopup from "./components/LabelCreationPopup/LabelCreationPopup";
import LabelRemovalPopup from "./components/LabelRemovalPopup/LabelRemovalPopup";
import TaskDeletionPopup from "./components/TaskDeletionPopup/TaskDeletionPopup";
import TaskLabelManagementPopup from "./components/TaskLabelManagementPopup/TaskLabelManagementPopup";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default function App() {

  const [client, setClient] = useState<Client | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {

    const client = new Client();
    setClient(client);

  }, []);

  useEffect(() => {

    (async () => {
     
      if (client) {
        
        await client.initialize();
        setIsReady(true);

      }
      
    })();

  }, [client]);

  const location = useLocation();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("Planzea");
  return client && isReady ? (
    <>
      <TaskPopup project={currentProject} setCurrentProject={(project) => setCurrentProject(project)} client={client} />
      <LabelRemovalPopup client={client} documentTitle={documentTitle} project={currentProject} setCurrentProject={setCurrentProject} />
      <LabelCreationPopup client={client} documentTitle={documentTitle} project={currentProject} setCurrentProject={setCurrentProject} />
      <ProjectCreationPopup client={client} documentTitle={documentTitle} />
      <TaskDeletionPopup client={client} />
      <TaskLabelManagementPopup client={client} documentTitle={documentTitle} project={currentProject} />
      <Header client={client} currentProject={currentProject} />
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
        <Route path="/:username/projects/:projectId/settings/labels" element={<SettingsPage client={client} project={currentProject} setCurrentProject={setCurrentProject} setDocumentTitle={setDocumentTitle} />} />
        <Route path="/" element={<HomePage client={client} setDocumentTitle={setDocumentTitle} setCurrentProject={setCurrentProject} />} />
      </Routes>
    </>
  ) : null;

}