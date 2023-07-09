import React, { useEffect, useRef, useState } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import Status from "../../client/Status";
import styles from "./StatusSelector.module.css";

export default function StatusSelector({showName, selectedStatus, statuses, onChange}: {showName?: boolean; statuses: Status[]; selectedStatus: Status; onChange: (status: Status) => void}) {

  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState<boolean>(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => setIsStatusSelectorOpen(false), [statuses, selectedStatus]);

  return (
    <>
      <button className={`${styles.statusContainer}${showName ? ` ${styles.withName}` : ""}`} onClick={() => setIsStatusSelectorOpen(!isStatusSelectorOpen)} ref={statusButtonRef}>
        <span className={"statusIcon"} style={selectedStatus?.color ? {backgroundColor: `#${selectedStatus.color.toString(16)}`} : undefined} />
        {
          showName ? (
            <span>
              {selectedStatus.name}
            </span>
          ) : null
        }        
      </button>
      <ContextMenu isOpen={isStatusSelectorOpen} options={statuses.map((status) => ({label: status.name, onClick: (event) => {
          
        event.stopPropagation();
        onChange(status);
        setIsStatusSelectorOpen(false);
      
      }}))} onOutsideClick={() => setIsStatusSelectorOpen(false)} triggerElement={statusButtonRef.current} />
    </>
  );

}