import React, { useEffect, useRef, useState } from "react";
import styles from "./TaskPopup.module.css";
import Icon from "../Icon/Icon";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";

export default function TaskPopup({isOpen, onClose, task}: {isOpen: boolean; onClose: () => void; task: Task}) {

  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {

    setTimeout(() => setIsShown(isOpen), 20);

  }, [isOpen]);

  const descriptionRef = useRef<HTMLElement>(null);
  async function updateDescription() {

    const descriptionInput = descriptionRef.current;
    if (descriptionInput) {

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
      // await task?.update({description: newDescription});

      // Update the description view.
      if (!newDescription) {

        // Check if there's a BR in the first element.
        const potentialBR = descriptionInput.children[0].children[0];
        if (potentialBR.tagName === "BR") {

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
      const { startContainer, endContainer } = range;
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

  return (
    <section id={styles.popupContainer} className={isShown ? styles.open : undefined} onTransitionEnd={() => {
      
      if (!isShown) {

        navigate("/personal/tasks");
        onClose();

      }
    
    }}>
      <section id={styles.popup}>
        <section id={styles.popupHeader}>
          <label>Project Name</label>
          <span id={styles.actions}>
            <button>
              <Icon name="more_horiz" />
            </button>
            <button id={styles.closeButton} onClick={() => setIsShown(false)}>
              <Icon name="close" />
            </button>
          </span>
        </section>
        <section id={styles.popupContent}>
          <h1>{task.name}</h1>
          <nav>
            <button className={styles.selected}>Details</button>
            <button>Activity</button>
          </nav>
          <section id={styles.details}>
            <section 
              id={styles.description} 
              ref={descriptionRef}
              contentEditable 
              onKeyDown={verifyKey}
              suppressContentEditableWarning
              onBlur={updateDescription}>
              <p placeholder="What's this task about?" />
            </section>
            <section>
              <label>Labels</label>
              <p>This task doesn't have any labels.</p>
            </section>
          </section>
        </section>
      </section>
    </section>
  );

}