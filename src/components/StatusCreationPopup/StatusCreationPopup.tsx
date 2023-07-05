import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";
import { useNavigate, useSearchParams } from "react-router-dom";
import Project from "../../client/Project";
import { SetState } from "../../App";
import CacheClient from "../../client/CacheClient";
import { InitialStatusProperties } from "../../client/Status";
import ColorInput from "../ColorInput/ColorInput";

export default function StatusCreationPopup({ client, setTempDocumentTitle }: { client: CacheClient; setTempDocumentTitle: SetState<string | null>; }) {

  const [isCreatingStatus, setIsCreatingStatus] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
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

  const initialStatusName = searchParams.get("name");
  const createValue = searchParams.get("create");
  const editValue = searchParams.get("edit");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [statusProperties, setStatusProperties] = useState<InitialStatusProperties>({ name: "" });
  useEffect(() => {

    (async () => {

      if (createValue === "status") {

        if (project) {

          if (initialStatusName) {

            setStatusProperties({ name: initialStatusName });

          }

          setIsOpen(true);

        }

      } else {

        setIsOpen(false);

      }

    })();

  }, [editValue, createValue, project, initialStatusName]);

  const [hex, setHex] = useState<{code: string; isValid: boolean}>({code: "", isValid: true});
  useEffect(() => {

    (async () => {

      if (project && isCreatingStatus) {

        await project.createStatus({...statusProperties, color: hex.isValid ? parseInt(hex.code, 16) : undefined});
        setIsOpen(false);

      }

      setIsCreatingStatus(false);

    })();

  }, [project, isCreatingStatus]);

  return (
    <Popup name="New status" isOpen={isOpen} onClose={() => {

      setTempDocumentTitle(null);
      navigate(location.pathname, { replace: true });
      setStatusProperties({ name: "" });

    }} maxWidth={420}>
      <form onSubmit={(event) => {

        event.preventDefault();
        setIsCreatingStatus(true);

      }}>
        <FormSection name="Status name">
          <input type="text" value={statusProperties.name} onChange={({ target: { value } }) => setStatusProperties({ name: value })} />
        </FormSection>
        <FormSection name="Status color">
          <ColorInput hexCode={hex.code} onChange={(code, isValid) => setHex({code, isValid})} />
        </FormSection>
        <section style={{ flexDirection: "row" }}>
          <input type="submit" value={"Create status"} disabled={isCreatingStatus || !statusProperties.name || !hex.isValid} />
          <button onClick={(event) => {

            event.preventDefault();
            setIsOpen(false);

          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  );

}