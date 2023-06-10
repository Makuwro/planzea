import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Client from "../../client/Client";
import Task from "../../client/Task";

export default function TaskDeletionPopup({client}: {client: Client}) {

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
        setIsMounted(true);
        setTask(task);
        setIsOpen(true);

      }
      
    })();

  }, [deleteValue]);

  // Check if the user confirmed the deletion.
  const [didUserConfirmDeletion, setDidUserConfirmDeletion] = useState<boolean>(false);
  const [shouldDeleteSubtasks, setShouldDeleteSubtasks] = useState<boolean>(true);
  useEffect(() => {

    (async () => {

      if (task && didUserConfirmDeletion) {

        await task.delete(shouldDeleteSubtasks);
        setIsOpen(false);

      }

    })();

  }, [task, didUserConfirmDeletion, shouldDeleteSubtasks]);

  // Check if the popup is open.
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return isMounted && task ? (
    <Popup name="Confirm task deletion" isOpen={isOpen} onClose={() => {

      navigate(location.pathname, {replace: true});
      setTask(null);
      setIsMounted(false);
      setDidUserConfirmDeletion(true);
      setShouldDeleteSubtasks(true);
      
    }}>
      <form onSubmit={(event) => {

        event.preventDefault();
        setDidUserConfirmDeletion(true);

      }}>
        <p>Are you sure you want to delete the <b>{task.name}</b> task? No takesies-backsies.</p>
        <span>
          <section style={{display: "flex"}}>
            <label>Delete sub-tasks</label>
            <input type="checkbox" checked={shouldDeleteSubtasks} onChange={() => setShouldDeleteSubtasks(!shouldDeleteSubtasks)} />
          </section>
          <section>  
            <input type="submit" disabled={didUserConfirmDeletion} onClick={() => setDidUserConfirmDeletion(true)} value="Delete task" />
            <button disabled={didUserConfirmDeletion} onClick={() => setIsOpen(false)}>Cancel</button>
          </section>
        </span>
      </form>
    </Popup>
  ) : null;

}