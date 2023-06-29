import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Client from "../../client/Client";
import Project from "../../client/Project";
import { SetState } from "../../App";

export default function ProjectDeletionPopup({client, setTempDocumentTitle}: {client: Client; setTempDocumentTitle: SetState<string | null>}) {

  // Check if the user is requesting to delete a task.
  const [searchParams] = useSearchParams();
  const deleteValue = searchParams.get("delete");
  const projectId = searchParams.get("id");
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {

    (async () => {

      if (deleteValue === "project" && projectId) {

        const project = await client.getProject(projectId);
        setTempDocumentTitle(`Confirm project deletion ▪ ${project.name}`);
        setIsMounted(true);
        setProject(project);
        setIsOpen(true);

      }
      
    })();

  }, [deleteValue]);

  // Check if the user confirmed the deletion.
  const [didUserConfirmDeletion, setDidUserConfirmDeletion] = useState<boolean>(false);
  useEffect(() => {

    (async () => {

      if (project && didUserConfirmDeletion) {

        await project.delete();
        setIsOpen(false);

      }

    })();

  }, [project, didUserConfirmDeletion]);

  // Check if the popup is open.
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return isMounted && project ? (
    <Popup name="Confirm project deletion" maxWidth={535} isOpen={isOpen} onClose={() => {

      navigate(location.pathname, {replace: true});
      setProject(null);
      setTempDocumentTitle(null);
      setIsMounted(false);
      setDidUserConfirmDeletion(false);
      
    }}>
      <form onSubmit={(event) => {

        event.preventDefault();
        setDidUserConfirmDeletion(true);

      }}>
        <p>Are you sure you want to delete the <b>{project.name}</b> project? This will also delete every task in this project.</p>
        <section>
          <section style={{display: "flex", gap: "15px"}}>  
            <input type="submit" disabled={didUserConfirmDeletion} onClick={() => setDidUserConfirmDeletion(true)} value="Delete task" />
            <button disabled={didUserConfirmDeletion} onClick={(event) => {
              
              event.preventDefault();
              setIsOpen(false);
            
            }}>Cancel</button>
          </section>
        </section>
      </form>
    </Popup>
  ) : null;

}