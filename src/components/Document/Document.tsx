import React, { useState, useEffect, useRef } from "react";
import DocumentHistoryController from "../../DocumentHistoryController";
import DocumentContentContainer from "../DocumentContentContainer/DocumentContentContainer";
import DocumentToolbar from "../DocumentToolbar/DocumentToolbar";

export type EditedMS = {initial: number; latest: number} | null;

export default function Document() {
  
  const [historyController] = useState<DocumentHistoryController>(new DocumentHistoryController());
  const [editedMS, setEditedMS] = useState<EditedMS>(null);
  const contentContainerRef = useRef<HTMLElement>(null);

  // Keep track of edit time.
  // The stopwatch starts when the user types,
  // then pauses when the user stops typing.
  const [totalEditTime, setTotalEditTime] = useState<number>(0);
  useEffect(() => {

    if (editedMS) {

      const timeout = setTimeout(() => {

        setTotalEditTime(totalEditTime + (editedMS.latest - editedMS.initial));
        setEditedMS(null);

      }, 1000);

      return () => {

        clearTimeout(timeout);

      };

    }

  }, [editedMS]);

  return (
    <>
      <DocumentToolbar editTime={totalEditTime} contentContainerRef={contentContainerRef} historyController={historyController} />
      <DocumentContentContainer editedMS={editedMS} setEditedMS={setEditedMS} ref={contentContainerRef} />
    </>
  );

}