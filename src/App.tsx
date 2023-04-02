import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Location, matchPath, Route, Routes, useLocation } from "react-router-dom";
import Client from "./client/Client";
import Project from "./client/Project";
import Backlog from "./components/Backlog/Backlog";
import Calendar from "./components/Calendar/Calendar";
import ProjectSelector from "./components/ProjectSelector/ProjectSelector";
import "./global.css";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default function App() {

  const [client] = useState(new Client());
  const [project, setProject] = useState<Project | null>(null);
  const newLocation = useLocation();
  const [currentLocation, setCurrentLocation] = useState<Location>(newLocation);

  useEffect(() => {

    (async () => {

      const matchedPath = !matchPath("/calendar", newLocation.pathname) ? matchPath("/:projectId/*", newLocation.pathname) : undefined;
      const desiredProjectId = matchedPath?.params.projectId;
      if (desiredProjectId && desiredProjectId !== project?.id) {

        const project = await client.getProject(desiredProjectId);
        setProject(project);

      }
      
      setCurrentLocation(newLocation);

    })();

  }, [newLocation, project]);

  return (
    <>
      <Routes location={currentLocation}>
        <Route path="/" element={<ProjectSelector client={client} />} />
        <Route path="/calendar" element={<Calendar client={client} />} />
        <Route path="/:projectId/issues" element={<Backlog client={client} project={project} />} />
        <Route path="/:projectId/issues/:issueId" element={<Backlog client={client} project={project} />} />
        <Route path="/:projectId/issues/:issueId/labels" element={<Backlog client={client} project={project} />} />
      </Routes>
    </>
  );

}