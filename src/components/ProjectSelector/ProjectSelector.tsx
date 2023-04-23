import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import styles from "./ProjectSelector.module.css";
import Exporter from "../Exporter/Exporter";

export default function ProjectSelector({client}: {client: Client}) {

  const [projectComponents, setProjectComponents] = useState<React.ReactElement[]>([]);
  const [isExporterOpen, setIsExporterOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  async function createProject() {

    const projectName = prompt("Enter a project name");
    if (projectName) {

      const { id: projectId } = await client.createProject({name: projectName});
      navigate(`/${projectId}/issues`);

    }

  }
  
  useEffect(() => {

    (async () => {

      const newProjectComponents = [];
      for (const project of await client.getProjects()) {

        newProjectComponents.push(
          <li key={project.id}>
            <button onClick={() => navigate(`/${project.id}/issues`)}>
              {project.name}
            </button>
          </li>
        );

      }
      setProjectComponents(newProjectComponents);

    })();

  }, []);

  return (
    <main id={styles.main}>
      <Exporter client={client} isOpen={isExporterOpen} onClose={() => setIsExporterOpen(false)} />
      <section id={styles.headingContainer}> 
        <h1>Projects</h1>
        <section>
          <button onClick={() => setIsExporterOpen(true)}>Export projects</button>
          <button onClick={createProject}>Create project</button>
        </section>
      </section>
      <ul>
        {projectComponents}
      </ul>
    </main>
  );

}