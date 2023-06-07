import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";
import Client from "../../client/Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InitialProjectProperties } from "../../client/Project";

export default function ProjectCreationPopup({client, documentTitle}: {client: Client; documentTitle: string}) {

  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [projectProperties, setProjectProperties] = useState<InitialProjectProperties>({name: ""});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createValue = searchParams.get("create");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {

    if (createValue === "project") {

      document.title = "New project ▪ Planzea";
      setIsOpen(true);

    } else {

      document.title = documentTitle;
      setIsOpen(false);

    }

  }, [createValue]);

  useEffect(() => {

    (async () => {

      if (isCreatingProject) {

        // Create the project and redirect to it.
        const project = await client.createProject(projectProperties);
        navigate(`/personal/projects/${project.id}`, {replace: true});

      }

    })();

  }, [isCreatingProject]);

  return (
    <Popup name="New project" isOpen={isOpen} onClose={() => navigate("/", {replace: true})} maxHeight={250} maxWidth={420}>
      <p>A project serves as a container for all of your tasks.</p>
      <form onSubmit={(event) => {
        
        event.stopPropagation();
        setIsCreatingProject(true);

      }}>
        <FormSection name="Project name">
          <input type="text" value={projectProperties.name} onChange={({target: {value}}) => setProjectProperties({name: value})} placeholder="World Domination Plans" />
        </FormSection>
        <section style={{flexDirection: "row"}}> 
          <input type="submit" value="Create project" disabled={isCreatingProject} />
          <button>Cancel</button>
        </section>
      </form>
    </Popup>
  );

}