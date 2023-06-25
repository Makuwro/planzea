import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";
import Client from "../../client/Client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import Label, { InitialLabelProperties } from "../../client/Label";
import { SetState } from "../../App";
import Task from "../../client/Task";

export default function LabelCreationPopup({client, setTempDocumentTitle, project, setCurrentProject}: {client: Client; setTempDocumentTitle: SetState<string | null>; project: Project | null; setCurrentProject: Dispatch<SetStateAction<Project | null>>}) {

  const [isCreatingLabel, setIsCreatingLabel] = useState<boolean>(false);
  const [labelProperties, setLabelProperties] = useState<InitialLabelProperties>({name: ""});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createValue = searchParams.get("create");
  const editValue = searchParams.get("edit");
  const labelId = searchParams.get("id");
  const initialLabelName = searchParams.get("name");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const params = useParams<{projectId: string}>();
  const isEditing = editValue === "label";
  const [label, setLabel] = useState<Label | null>(null);

  useEffect(() => {

    (async () => {

      if (isEditing || createValue === "label") {

        if (project) {

          let label;
          if (isEditing) {

            if (labelId) {

              label = await client.getLabel(labelId);
              setLabel(label);
              setLabelProperties({name: label.name});

            } else {

              navigate(location.pathname, {replace: true});
              return;

            }

          } else if (initialLabelName) {

            setLabelProperties({name: initialLabelName});
            
          }

          setTempDocumentTitle(`${isEditing ? "Edit" : "New"} label ▪ ${label ? `${label.name} ▪ ` : ""}${project.name}`);
          setIsOpen(true);

        } else if (params.projectId) {

          const project = await client.getProject(params.projectId);
          if (project) {

            setCurrentProject(project);

          }

        }

      } else {

        setIsOpen(false);

      }

    })();

  }, [editValue, createValue, project, initialLabelName]);

  const [shouldAddLabelToTask, setShouldAddLabelToTask] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const taskId = searchParams.get("taskId");
  useEffect(() => {

    (async () => {

      if (taskId) {

        const task = await client.getTask(taskId);
        if (task) {

          setTask(task);
          setShouldAddLabelToTask(true);

        }

      }

    })();

  }, [taskId]);

  useEffect(() => {

    (async () => {

      if (project && isCreatingLabel) {
        
        if (label && isEditing) {

          await label.update(labelProperties);

        } else {

          const label = await project.createLabel(labelProperties);
          if (task && taskId && shouldAddLabelToTask) {

            await task.update({labelIds: [...task.labelIds, label.id]});

          }

        }
        setIsOpen(false);

      }
      
      setIsCreatingLabel(false);

    })();

  }, [isCreatingLabel]);

  return (
    <Popup name={`${isEditing ? "Edit" : "New"} label`} isOpen={isOpen} onClose={() => {
      
      setTempDocumentTitle(null);
      navigate(location.pathname, {replace: true});
      setLabelProperties({name: ""});
      setLabel(null);
    
    }} maxWidth={420}>
      <form onSubmit={(event) => {
        
        event.preventDefault();
        setIsCreatingLabel(true);

      }}>
        <FormSection name="Label name">
          <input type="text" value={labelProperties.name} onChange={({target: {value}}) => setLabelProperties({name: value})} />
        </FormSection>
        {
          task ? (
            <FormSection>
              <label>Add this label to task: {task.name}</label>
              <input type="checkbox" checked={shouldAddLabelToTask} onChange={() => setShouldAddLabelToTask(!shouldAddLabelToTask)} />
            </FormSection>
          ) : null
        }
        <section style={{flexDirection: "row"}}> 
          <input type="submit" value={`${isEditing ? "Edit" : "Create"} label`} disabled={isCreatingLabel || !labelProperties.name} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  );

}