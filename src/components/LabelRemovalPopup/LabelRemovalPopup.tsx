import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import Client from "../../client/Client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import Label from "../../client/Label";

export default function LabelRemovalPopup({client, documentTitle, project, setCurrentProject}: {client: Client; documentTitle: string; project: Project | null; setCurrentProject: Dispatch<SetStateAction<Project | null>>}) {

  const [isDeletingLabel, setIsDeletingLabel] = useState<boolean>(false);
  const [label, setLabel] = useState<Label | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deleteValue = searchParams.get("remove");
  const labelId = searchParams.get("id");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const params = useParams<{projectId: string}>();

  useEffect(() => {

    (async () => {

      if (labelId && deleteValue === "label") {

        if (project) {

          const label = await client.getLabel(labelId);
          if (label) {

            document.title = `Remove label ▪ ${project.name} ▪ Planzea`;
            setLabel(label);

          } else {

            navigate(location.pathname, {replace: true});

          }

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

  }, [deleteValue, labelId, project]);

  useEffect(() => {

    setTimeout(() => setIsOpen(Boolean(label)), 50);

  }, [label]);

  useEffect(() => {

    (async () => {

      if (project && isDeletingLabel && label) {

        // Create the project and redirect to it.
        await label.removeFromProject(project.id);
        setIsOpen(false);

      }
      
      setIsDeletingLabel(false);

    })();

  }, [label, isDeletingLabel]);

  return label ? (
    <Popup name="Remove label" isOpen={isOpen} onClose={() => {
      
      navigate(location.pathname, {replace: true});
      setLabel(null);

    }} maxWidth={460}>
      <p>Are you sure you want to remove <b>{label.name}</b> from the project? This will remove this label from all tasks.</p>
      <form onSubmit={(event) => {
        
        event.preventDefault();
        setIsDeletingLabel(true);

      }}>
        <section style={{flexDirection: "row"}}> 
          <input type="submit" value="Remove label" disabled={isDeletingLabel} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  ) : null;

}