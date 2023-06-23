import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import Client from "../../client/Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import Task from "../../client/Task";

export default function TaskLabelManagementPopup({client, documentTitle, project}: {client: Client; documentTitle: string; project: Project | null;}) {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const manageValue = searchParams.get("manage");
  const taskId = searchParams.get("taskId");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [taskProject, setTaskProject] = useState<Project | null>(project);

  useEffect(() => {

    (async () => {

      if (manageValue === "task-labels") {

        if (taskId && task?.id !== taskId) {

          const task = await client.getTask(taskId);
          setTask(task);

          const taskProjectCopy = taskProject?.id === task.projectId ? taskProject : await client.getProject(task.projectId);
          setTaskProject(taskProjectCopy);

          if (task && taskProjectCopy) {

            setTimeout(() => document.title = `Manage task labels ▪ ${task.name} ▪ ${taskProjectCopy.name}`, 1);
            setIsOpen(true);

          } else {

            navigate(location.pathname, {replace: true});
            
          }

        } 

      } else {

        document.title = documentTitle;
        setIsOpen(false);

      }

    })();

  }, [manageValue, taskId]);

  return project && task ? (
    <Popup name={"Manage task labels"} isOpen={isOpen} onClose={() => {
      
      navigate(location.pathname, {replace: true});
      setTask(null);
    
    }} maxWidth={420}>
      <p>This project doesn't have any available labels. Would you like to change that?</p>
      <button onClick={() => navigate(`/personal/projects/${project.id}/settings/labels`, {replace: true})}>Manage labels</button>
    </Popup>
  ) : null;

}