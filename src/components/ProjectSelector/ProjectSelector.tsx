import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../../client/Client";

export default function ProjectSelector({client}: {client: Client}) {

  const [projectComponents, setProjectComponents] = useState<React.ReactElement[]>([]);
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
    <main>
      <button onClick={createProject}>Create project</button>
      <ul>
        {projectComponents}
      </ul>
    </main>
  );

}