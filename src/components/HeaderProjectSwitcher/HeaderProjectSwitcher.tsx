import React, { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";
import styles from "./HeaderProjectSwticher.module.css";
import Project from "../../client/Project";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useNavigate } from "react-router-dom";
import CacheClient from "../../client/CacheClient";

export default function HeaderProjectSwitcher({client}: {client: CacheClient}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get a list of projects.
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(client.currentProject);
  useEffect(() => {

    (async () => setProjects(await client.getProjects()))();

    const onCurrentProjectChange = (project: Project | null) => setCurrentProject(project);

    client.addEventListener("currentProjectChange", onCurrentProjectChange);

    return () => client.removeEventListener("currentProjectChange", onCurrentProjectChange);

  }, [client]);

  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <section>
      <button id={styles.button} onClick={() => setIsOpen(!isOpen)} disabled={!projects[0]} ref={buttonRef}>
        <Icon name="home" />
        <span id={styles.name}>{currentProject?.name ?? "Home"}</span>
      </button>
      <ContextMenu isOpen={isOpen} options={projects.map((project) => ({label: project.name, onClick: () => {
        
        if (currentProject?.id !== project.id) {

          navigate(`/personal/projects/${project.id}`);

        }
        setIsOpen(false);
      
      }}))} onOutsideClick={() => setIsOpen(false)} triggerElement={buttonRef.current} />
    </section>
  );

}