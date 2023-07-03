import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./TaskPopup.module.css";
import Icon from "../Icon/Icon";
import Task from "../../client/Task";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import DateInput from "../DateInput/DateInput";
import Client from "../../client/Client";
import TaskPopupAttachmentSection from "../TaskPopupAttachmentSection/TaskPopupAttachmentSection";
import TaskPopupSubTaskSection from "../TaskPopupSubTaskSection/TaskPopupSubTaskSection";
import Project from "../../client/Project";
import Popup from "../Popup/Popup";
import { SetState } from "../../App";
import LabelInput from "../LabelInput/LabelInput";
import Status from "../../client/Status";

export default function TaskPopup({client, setTempDocumentTitle, project, setCurrentProject}: {setTempDocumentTitle: SetState<string | null>; client: Client; project: Project | null; setCurrentProject: Dispatch<SetStateAction<Project | null>>}) {

  const location = useLocation();
  const [task, setTask] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {

    (async () => {

      const taskId = matchPath("/:username/projects/:projectId/tasks/:taskId", location.pathname)?.params.taskId;
      if (client && taskId) {

        const task = await client.getTask(taskId);

        if (!project) {

          setCurrentProject(await client.getProject(task.projectId));

        }

        setTask(task);

      } else {
        
        setIsOpen(false);

      }

    })();

  }, [client, location]);

  const [descriptionComponents, setDescriptionComponents] = useState<React.ReactElement[]>([<p key={0} placeholder="What's this task about?" />]);
  useEffect(() => {

    if (task && project) {

      if (task.description) {

        const paragraphs = task.description.split("\n");
        const descriptionComponents = [];
        for (let i = 0; paragraphs.length > i; i++) {

          descriptionComponents.push(
            <p key={i}>
              {paragraphs[i]}
            </p>
          );

        }
        setDescriptionComponents(descriptionComponents);

      } else {

        setDescriptionComponents([<p key={0} placeholder="What's this task about?" />]);

      }

      // Set the document title.
      setTempDocumentTitle(`${task.name} ▪ ${project.name}`);

      // Listen to the events.
      const onTaskUpdate = (newTask: Task) => {

        if (newTask.id === task.id) {

          setTask(newTask);

        }

      };

      const onTaskDelete = (taskId: string) => {

        if (taskId === task.id) {

          navigate(`/personal/projects/${project ? project.id : task.projectId}/tasks`, {replace: true});

        }

      };

      client.addEventListener("taskUpdate", onTaskUpdate);
      client.addEventListener("taskDelete", onTaskDelete);
      
      setIsOpen(true);

      return () => {
        
        client.removeEventListener("taskUpdate", onTaskUpdate);
        client.removeEventListener("taskDelete", onTaskDelete);

      };

    }

  }, [task, project]);

  const [statuses, setStatuses] = useState<Status[]>([]);
  useEffect(() => {

    (async () => {

      if (project) {

        const newStatuses = [];
        for (const statusId of project.statusIds) {

          newStatuses.push(await client.getStatus(statusId));

        }
        setStatuses(newStatuses);

      }

    })();

  }, [project]);

  const descriptionRef = useRef<HTMLElement>(null);
  async function updateDescription() {

    const descriptionInput = descriptionRef.current;
    if (task && descriptionInput) {

      // Convert the description to Markdown.
      let newDescription = "";
      for (const element of descriptionInput.children) {

        // Add a line break, if necessary.
        if (newDescription.trim()) {

          newDescription += "\n";

        }

        // Determine the type of element we're on.
        switch (element.tagName) {

          case "P":
            newDescription += element.textContent;
            break;

          default:
            console.warn("Found an unknown tag while trying to convert description to Markdown. Skipping it.");
            break;

        }

      }

      // Save the new description.
      await task.update({description: newDescription});

      // Update the description view.
      if (!newDescription) {

        // Check if there's a BR in the first element.
        const potentialBR = descriptionInput.children[0].children[0];
        if (potentialBR?.tagName === "BR") {

          potentialBR.remove();

        }

      }

    }

  }

  function verifyKey(event: React.KeyboardEvent) {

    const descriptionInput = descriptionRef.current;
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (descriptionInput && selection && range && event.key === "Backspace") {

      // Check if the user is at the beginning of the first paragraph.
      const { startContainer } = range;
      if (startContainer === descriptionInput && range.startOffset === 0 && range.endOffset === 1) {

        event.preventDefault();
        descriptionInput.childNodes[0].textContent = "";

        // Reset selection.
        const newRange = document.createRange();
        newRange.setStart(descriptionInput.childNodes[0], 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return;

      }

      const startParent = startContainer.parentElement;
      const startIndex = startParent && [...descriptionInput.children].indexOf(startContainer instanceof Element ? startContainer : startParent);
      const isFirstParagraphSelected = startIndex === 0;

      if (isFirstParagraphSelected && range.startOffset === 0 && range.endOffset === 0) {

        event.preventDefault();
        return;

      }

      if (startParent && isFirstParagraphSelected && range.startOffset === 0) {

        // Prevent the user from deleting the first paragraph.
        event.preventDefault();

        // Splice the first paragraph and end paragraph text.
        const endParent = range.endContainer.parentElement;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(startParent);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preCaretRange.toString().length;
        preCaretRange.selectNodeContents(endParent ?? startParent);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preCaretRange.toString().length;
        const startText = startParent.textContent?.slice(0, startOffset) ?? "";
        startParent.textContent = `${startText}${(endParent ?? startParent).textContent?.slice(endOffset) ?? ""}`;

        if (endParent && startParent !== endParent) {

          // Remove the other elements.
          const descriptionChildren = [...descriptionRef.current.children];
          const endIndex = descriptionChildren.indexOf(endParent);
          for (let i = startIndex + 1; endIndex >= i; i++) {

            descriptionChildren[i].remove();

          }

          // Reset selection.
          const newRange = document.createRange();
          newRange.setStart(startParent, startText.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);

        }

        return;

      }

      // For some reason, Firefox prevents users from typing after they replace a chunk of the text.
      // It probably has something to do with the range because this line fixes the problem.
      range.setEnd(range.endContainer, range.endOffset);

    }
    
  }

  const navigate = useNavigate();
  const popupContainerRef = useRef<HTMLElement>(null);

  if (project && task) {

    // Determine if the due date has expired.
    const currentDate = new Date();
    currentDate.setMilliseconds(0);
    currentDate.setSeconds(0);
    currentDate.setMinutes(0);
    currentDate.setHours(0);
    currentDate.setDate(currentDate.getDate() - 1);
    const isPastDue = task.dueDate ? new Date(task.dueDate).getTime() < currentDate.getTime() : false;

    const currentStatus = statuses.find((possibleStatus) => possibleStatus.id === task.statusId);

    return (
      <Popup popupContainerRef={popupContainerRef} actions={
        <>
          {
            currentStatus ? (
              <span>
                <button id={styles.status}>
                  {currentStatus.name}
                </button>
              </span>
            ) : null
          }
          <button onClick={() => navigate(`?delete=task&id=${task.id}`, {replace: true})}>
            <Icon name="delete" />
          </button>
        </>
      } isOpen={isOpen} name={task.name} onClose={() => {

        setTask(null);
        setTempDocumentTitle(null);
        navigate(`/personal/projects/${project.id}/tasks`);

      }} popupContentPadding={0}>
        <section id={styles.details}>
          <h1 id={styles.taskName}>{task.name}</h1>
          <section 
            id={styles.description} 
            ref={descriptionRef}
            contentEditable 
            onKeyDown={verifyKey}
            suppressContentEditableWarning
            onBlur={updateDescription}>
            {descriptionComponents}
          </section>
          <TaskPopupSubTaskSection statuses={statuses} popupContainerRef={popupContainerRef} client={client} task={task} project={project} />
          <section>
            <label>Labels</label>
            <LabelInput resultsContainer={popupContainerRef?.current ?? undefined} client={client} labelIds={task.labelIds} taskId={task.id} onChange={async (labelIds) => await task.update({labelIds})} />
          </section>
          <section>
            <label className={isPastDue ? styles.expired : undefined}>
              Due date
              {isPastDue ? <Icon name="warning" /> : null}
            </label>
            <span>
              <DateInput date={task.dueDate} onChange={async (newDate) => await task.update({dueDate: newDate})} />
            </span>
          </section>
          <TaskPopupAttachmentSection task={task} />
        </section>
      </Popup>
    );

  } 

  return null;

}