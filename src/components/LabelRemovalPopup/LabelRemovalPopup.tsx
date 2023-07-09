import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { SetState } from "../../App";
import CacheClient from "../../client/CacheClient";

export default function LabelRemovalPopup({client, setTempDocumentTitle}: {client: CacheClient; setTempDocumentTitle: SetState<string | null>;}) {

  const [isDeletingLabel, setIsDeletingLabel] = useState<boolean>(false);
  const [label, setLabel] = useState<Label | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deleteValue = searchParams.get("delete");
  const labelId = searchParams.get("id");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(client.currentProject);
  const { projectId } = useParams<{projectId: string}>();

  useEffect(() => {

    (async () => {

      if (!client.currentProject && projectId) {

        client.setCurrentProject(await client.getProject(projectId));

      }

    })();

    const onCurrentProjectChange = (project: Project | null) => {

      setProject(project);

    };

    client.addEventListener("currentProjectChange", onCurrentProjectChange);

    return () => client.removeEventListener("currentProjectChange", onCurrentProjectChange);

  }, [client, projectId]);

  useEffect(() => {

    (async () => {

      if (labelId && deleteValue === "label" && project) {

        const label = await client.getLabel(labelId);
        if (label) {

          setTempDocumentTitle(`Delete label ▪ ${label.name} ▪ ${project.name}`);
          setLabel(label);

        } else {

          navigate(location.pathname, {replace: true});

        }

      } else {

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
        await project.update({labelIds: project.labelIds.filter((possibleLabelId) => possibleLabelId !== label.id)});
        setIsOpen(false);

      }
      
      setIsDeletingLabel(false);

    })();

  }, [label, isDeletingLabel]);

  return label ? (
    <Popup name="Delete label" isOpen={isOpen} onClose={() => {
      
      setTempDocumentTitle(null);
      navigate(location.pathname, {replace: true});
      setLabel(null);

    }} maxWidth={460}>
      <p>Are you sure you want to delete the <b>{label.name}</b> label? This will remove this label from all tasks.</p>
      <form onSubmit={(event) => {
        
        event.preventDefault();
        setIsDeletingLabel(true);

      }}>
        <section style={{flexDirection: "row"}}> 
          <input type="submit" value="Delete label" disabled={isDeletingLabel} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  ) : null;

}