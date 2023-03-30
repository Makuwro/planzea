import React, { useEffect, useRef, useState } from "react";
import Attachment from "../../client/Attachment";
import { convertBlobToArrayBuffer } from "../../client/Client";
import Issue from "../../client/Issue";
import Icon from "../Icon/Icon";

export default function AttachmentSection({issue}: {issue: Issue}) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {

    (async () => {
      
      if (files?.[0]) {
        
        const newAttachments = [];

        for (const file of files) {

          newAttachments.push(await issue.createAttachment({
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

    (async () => setAttachments(await issue.getAttachments()))();

  }, [issue]);

  return (
    <section>
      <label>Attachments</label>
      <section>
        <button onClick={() => fileInputRef.current?.click()}>Add attachment</button>
        <input type="file" ref={fileInputRef} onChange={(event) => setFiles(event.target.files)} multiple />
      </section>
      <ul>
        {
          attachments.map((attachment) => (
            <li key={attachment.id}>
              <section>
                <section>
                  <a href="#">{attachment.name}</a>
                  <label>0 KB</label>
                </section>
                <button onClick={async () => {
                  
                  await attachment.delete();
                  setAttachments(attachments.filter((possibleAttachment) => possibleAttachment.id !== attachment.id));
                
                }}>
                  <Icon name="close" />
                </button>
              </section>
            </li>
          ))
        }
      </ul>
    </section>
  );

}