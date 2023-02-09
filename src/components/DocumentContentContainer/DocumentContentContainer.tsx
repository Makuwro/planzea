import React, { forwardRef, ForwardedRef, Dispatch, SetStateAction } from "react";
import { EditedMS } from "../Document/Document.js";
import styles from "./DocumentContentContainer.module.css";

function DocumentContentContainer({editedMS, setEditedMS}: {editedMS: EditedMS, setEditedMS: Dispatch<SetStateAction<EditedMS>>}, ref: ForwardedRef<HTMLElement>) {
  
  function handleInput(event: React.KeyboardEvent) {

    const selection = window.getSelection();

    if (selection) {

      const range = selection.getRangeAt(0);

      if (event.type === "keydown" && event.key === "Tab") {

        event.preventDefault();

        // Remove the selected content.
        range.extractContents();

        // Replace the content with a tab.
        const {startContainer, startOffset} = range;
        startContainer.textContent = `${startContainer.textContent?.slice(0, startOffset)}	${startContainer.textContent?.slice(startOffset)}`;

        // Fix the caret.
        range.setStart(startContainer, startOffset + 1);

      }

    }

    const lastEditedMS = new Date().getTime();
    setEditedMS({
      initial: editedMS?.initial ?? lastEditedMS,
      latest: lastEditedMS
    });

  }

  return (
    <section 
      contentEditable 
      suppressContentEditableWarning 
      onKeyDown={handleInput}
      onKeyUp={handleInput}
      id={styles.textContainer}
      ref={ref}>
      <p>Click here to get started!</p>
    </section>
  );

}

export default forwardRef(DocumentContentContainer);