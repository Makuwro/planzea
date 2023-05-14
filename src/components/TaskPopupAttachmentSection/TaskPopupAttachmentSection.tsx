import React, { useEffect, useRef, useState } from "react";
import Attachment from "../../client/Attachment";
import { convertBlobToArrayBuffer } from "../../client/Client";
import Task from "../../client/Task";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupAttachmentSection.module.css";

export default function TaskPopupAttachmentSection({task}: {task: Task}) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {

    (async () => {

      if (files?.[0]) {

        const newAttachments = [];

        for (const file of files) {

          newAttachments.push(await task.createAttachment({
            name: file.name,
            type: file.type,
            arrayBuffer: await convertBlobToArrayBuffer(file)
          }));

        }

        setAttachments([...attachments, ...newAttachments]);
        setFiles(null);

      }

    })();

  }, [files]);

  useEffect(() => {

    (async () => setAttachments(await task.getAttachments()))();

  }, [task]);

  return (
    <section>
      <label>Attachments</label>
      <section>
        <button id={styles.button} onClick={() => fileInputRef.current?.click()}>Add attachment</button>
        <input type="file" ref={fileInputRef} onChange={(event) => setFiles(event.target.files)} multiple />
      </section>
      <ul id={styles.attachments}>
        {
          attachments.map((attachment) => {

            const blob = new Blob([attachment.arrayBuffer], {type: attachment.type});
            const url = URL.createObjectURL(blob);

            return (
              <li key={attachment.id}>
                <section>
                  <section>
                    <a href={url} target="_blank" rel="noreferrer">{attachment.name}</a>
                    <label>{blob.size / 1000} KB</label>
                  </section>
                  <button onClick={async () => {

                    await attachment.delete();
                    setAttachments(attachments.filter((possibleAttachment) => possibleAttachment.id !== attachment.id));

                  }}>
                    <Icon name="close" />
                  </button>
                </section>
              </li>
            );

          })
        }
      </ul>
    </section>
  );

}