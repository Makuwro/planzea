import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import { InitialLabelProperties } from "../../client/Label";
import { SetState } from "../../App";
import Task from "../../client/Task";
import CacheClient from "../../client/CacheClient";

export default function LabelCreationPopup({client, setTempDocumentTitle}: {client: CacheClient; setTempDocumentTitle: SetState<string | null>;}) {

  const [isCreatingLabel, setIsCreatingLabel] = useState<boolean>(false);
  const [labelProperties, setLabelProperties] = useState<InitialLabelProperties>({name: ""});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createValue = searchParams.get("create");
  const initialLabelName = searchParams.get("name");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {projectId} = useParams<{projectId: string}>();
  const [project, setProject] = useState<Project | null>(client.currentProject);

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

      if (createValue === "label") {

        if (project) {

          if (initialLabelName) {

            setLabelProperties({name: initialLabelName});
            
          }

          setIsOpen(true);

        }

      } else {

        setIsOpen(false);

      }

    })();

  }, [createValue, project, initialLabelName]);

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
        
        const label = await project.createLabel(labelProperties);
        if (task && taskId && shouldAddLabelToTask) {

          await task.update({labelIds: [...task.labelIds, label.id]});

        }

        setIsOpen(false);

      }
      
      setIsCreatingLabel(false);

    })();

  }, [isCreatingLabel]);

  return (
    <Popup name={"New label"} isOpen={isOpen} onClose={() => {
      
      setTempDocumentTitle(null);
      navigate(location.pathname, {replace: true});
      setLabelProperties({name: ""});
    
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
          <input type="submit" value={"Create label"} disabled={isCreatingLabel || !labelProperties.name} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  );

}