import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import Client from "../../client/Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SetState } from "../../App";
import Status from "../../client/Status";

export default function StatusDeletionPopup({client, setTempDocumentTitle}: {client: Client; setTempDocumentTitle: SetState<string | null>;}) {

  const [isDeletingStatus, setIsDeletingStatus] = useState<boolean>(false);
  const [status, setStatus] = useState<Status | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deleteValue = searchParams.get("delete");
  const statusId = searchParams.get("id");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {

    (async () => {

      if (statusId && deleteValue === "status") {

        try {

          const status = await client.getStatus(statusId);
          setTempDocumentTitle(`Delete status ▪ ${status.name}`);
          setStatus(status);

        } catch (err) {

          navigate(location.pathname, {replace: true});

        }

      } else {

        setIsOpen(false);

      }

    })();

  }, [deleteValue, statusId]);

  useEffect(() => {

    setTimeout(() => setIsOpen(Boolean(status)), 50);

  }, [status]);

  useEffect(() => {

    (async () => {

      if (isDeletingStatus && status) {

        // Create the project and redirect to it.
        await status.delete();
        setIsOpen(false);

      }
      
      setIsDeletingStatus(false);

    })();

  }, [status, isDeletingStatus]);

  return status ? (
    <Popup name="Delete status" isOpen={isOpen} onClose={() => {
      
      setTempDocumentTitle(null);
      navigate(location.pathname, {replace: true});
      setStatus(null);

    }} maxWidth={460}>
      <p>Are you sure you want to delete the <b>{status.name}</b> status? All tasks with this status will use the project's default status.</p>
      <form onSubmit={(event) => {
        
        event.preventDefault();
        setIsDeletingStatus(true);

      }}>
        <section style={{flexDirection: "row"}}> 
          <input className="destructive" type="submit" value="Delete status" disabled={isDeletingStatus} />
          <button onClick={(event) => {
            
            event.preventDefault();
            setIsOpen(false);
          
          }}>Cancel</button>
        </section>
      </form>
    </Popup>
  ) : null;

}