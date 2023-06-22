import React, { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";
import styles from "./HeaderProjectSwticher.module.css";
import Project from "../../client/Project";
import ContextMenu from "../ContextMenu/ContextMenu";
import Client from "../../client/Client";
import { useNavigate } from "react-router-dom";

export default function HeaderProjectSwitcher({client, currentProject}: {client: Client; currentProject: Project | null}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get a list of projects.
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {

    (async () => setProjects(await client.getProjects()))();

  }, []);

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