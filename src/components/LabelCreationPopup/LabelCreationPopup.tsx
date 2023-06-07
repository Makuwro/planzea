import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";
import Client from "../../client/Client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import { InitialLabelProperties } from "../../client/Label";

export default function LabelCreationPopup({client, documentTitle, project, setCurrentProject}: {client: Client; documentTitle: string; project: Project | null; setCurrentProject: Dispatch<SetStateAction<Project | null>>}) {

  const [isCreatingLabel, setIsCreatingLabel] = useState<boolean>(false);
  const [labelProperties, setLabelProperties] = useState<InitialLabelProperties>({name: ""});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createValue = searchParams.get("create");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const params = useParams<{projectId: string}>();

  useEffect(() => {

    (async () => {

      if (createValue === "label") {

        if (project) {

          console.log(`New label ▪ ${project.name} ▪ Planzea`);
          document.title = `New label ▪ ${project.name} ▪ Planzea`;
          setIsOpen(true);

        } else if (params.projectId) {

          const project = await client.getProject(params.projectId);
          if (project) {

            setCurrentProject(project);

          }

        }

      } else {

        document.title = documentTitle;
        setIsOpen(false);

      }

    })();

  }, [createValue, project]);

  useEffect(() => {

    (async () => {

      if (project && isCreatingLabel) {

        // Create the project and redirect to it.
        await project.createLabel(labelProperties);
        setIsOpen(false);

      }
      
      setIsCreatingLabel(false);

    })();

  }, [isCreatingLabel]);

  return (
    <Popup name="New label" isOpen={isOpen} onClose={() => {
      
      navigate(location.pathname, {replace: true});
      setLabelProperties({name: ""});
    
    }} maxHeight={250} maxWidth={420}>
      <p>A project serves as a container for all of your tasks.</p>
      <form onSubmit={(event) => {
        
        event.preventDefault();
        setIsCreatingLabel(true);

      }}>
        <FormSection name="Label name">
          <input type="text" value={labelProperties.name} onChange={({target: {value}}) => setLabelProperties({name: value})} placeholder="Really Cool" />
        </FormSection>
        <section style={{flexDirection: "row"}}> 
          <input type="submit" value="Create label" disabled={isCreatingLabel || !labelProperties.name} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  );

}