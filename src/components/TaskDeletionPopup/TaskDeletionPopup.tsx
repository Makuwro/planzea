import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Client from "../../client/Client";
import Task from "../../client/Task";
import Project from "../../client/Project";
import { SetState } from "../../App";

export default function TaskDeletionPopup({client, currentProject, setTempDocumentTitle}: {client: Client; currentProject: Project | null; setTempDocumentTitle: SetState<string | null>}) {

  // Check if the user is requesting to delete a task.
  const [searchParams] = useSearchParams();
  const deleteValue = searchParams.get("delete");
  const taskId = searchParams.get("id");
  const location = useLocation();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  useEffect(() => {

    (async () => {

      if (deleteValue === "task" && taskId) {

        const task = await client.getTask(taskId);
        setTempDocumentTitle(`Confirm task deletion ▪ ${task.name}${currentProject ? ` ▪ ${currentProject.name}` : ""}`);
        setIsMounted(true);
        setTask(task);
        setIsOpen(true);

      }
      
    })();

  }, [deleteValue]);

  // Check if the user confirmed the deletion.
  const [didUserConfirmDeletion, setDidUserConfirmDeletion] = useState<boolean>(false);
  useEffect(() => {

    (async () => {

      if (task && didUserConfirmDeletion) {

        await task.delete();
        setIsOpen(false);

      }

    })();

  }, [task, didUserConfirmDeletion]);

  // Check if the popup is open.
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return isMounted && task ? (
    <Popup name="Confirm task deletion" maxWidth={535} isOpen={isOpen} onClose={() => {

      navigate(location.pathname, {replace: true});
      setTask(null);
      setTempDocumentTitle(null);
      setIsMounted(false);
      setDidUserConfirmDeletion(false);
      
    }}>
      <form onSubmit={(event) => {

        event.preventDefault();
        setDidUserConfirmDeletion(true);

      }}>
        <p>Are you sure you want to delete the <b>{task.name}</b> task? No takesies-backsies.</p>
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