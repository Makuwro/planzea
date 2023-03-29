import React, { useState, useEffect, useRef, ReactElement } from "react";
import { useParams, useNavigate, useLocation, matchPath } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import LabelSelector from "../LabelSelector/LabelSelector";
import styles from "./IssueViewer.module.css";

export default function IssueViewer({ client, onIssueDelete, project }: { client: Client; onIssueDelete: (issueId: string) => void; project: Project }) {

  const { issueId } = useParams<{ issueId: string }>();
  const [newIssueName, setNewIssueName] = useState<string>("");
  const [labelComponents, setLabelComponents] = useState<ReactElement[]>([]);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [descriptionComponents, setDescriptionComponents] = useState<ReactElement[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {

      if (issueId) {

        try {

          // Create label components
          const newIssue = await client.getIssue(issueId);
          const projectLabels = await project.getLabels();
          const newLabelComponents = [];
          for (const labelId of (newIssue.labelIds ?? [])) {

            const label = projectLabels.find((possibleLabel) => possibleLabel.id === labelId);
            if (label) {

              newLabelComponents.push(
                <li key={labelId}>
                  <button onClick={() => navigate(`/${project.id}/issues?search=`)}>
                    {label.name}
                  </button>
                </li>
              );

            }

          }

          // Create description components
          if (newIssue.description) {

            const descriptionComponents = [];
            for (const paragraph of newIssue.description.split("\n")) {

              if (paragraph) {

                descriptionComponents.push(
                  <p key={descriptionComponents.length} tabIndex={-1}>
                    {paragraph}
                  </p>
                );

              }

            }
            setDescriptionComponents(descriptionComponents);

          } 

          setLabelComponents(newLabelComponents);
          setIssue(newIssue);
          setNewIssueName(newIssue.name);
          setIsOpen(true);

        } catch (err) {

          navigate("/");

        }

      } else if (issue) {

        setIssue(null);
        setIsOpen(false);

      }

    })();

  }, [issueId]);

  async function deleteIssue() {

    if (issue) {

      await issue.delete();
      onIssueDelete(issue.id);
      navigate("/");

    }

  }

  async function changeIssueName() {

    if (issue && newIssueName) {

      await issue.update({name: newIssueName});
      issue.name = newIssueName;
      setIssue(new Issue(structuredClone(issue), client));

    }

    setNewIssueName(issue?.name ?? "");

  }

  const descriptionRef = useRef<HTMLElement>(null);
  async function updateDescription(event: React.FocusEvent | React.KeyboardEvent | React.FormEvent) {

    // Ensure that the issue loaded in.
    const descriptionContainer = descriptionRef.current;
    if (issue && descriptionContainer) {

      const selection = document.getSelection();
      if (!selection) return;
      const range = selection.getRangeAt(0);
      if (event.type === "keydown" && "key" in event && event.key === "Backspace") {

        // Check if the user is at the beginning of the first paragraph.
        const startContainer = range.startContainer;
        if (startContainer === descriptionContainer && range.startOffset === 0 && range.endOffset === 1) {

          event.preventDefault();
          descriptionContainer.childNodes[0].textContent = "";

          // Reset selection.
          const newRange = document.createRange();
          newRange.setStart(descriptionContainer.childNodes[0], 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);

          return;

        }

        const startParent = startContainer.parentElement;
        const startIndex = startParent && [...descriptionContainer.children].indexOf(startContainer instanceof Element ? startContainer : startParent);
        const isFirstParagraphSelected = startIndex === 0;
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
            newRange.setStart(startParent.childNodes[0], startText.length);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

          }

          return;

        }

      }

      // For some reason, Firefox prevents users from typing after they replace a chunk of the text.
      // It probably has something to do with the range because this line fixes the problem.
      range.setEnd(range.endContainer, range.endOffset);
      
      // Update the issue description if it changed.
      let description = "";

      for (const node of descriptionContainer.childNodes) {

        if (node.textContent?.trim()) {

          description += `${node.textContent}\n`;
        
        }

      }

      if (description !== issue.description) {

        await issue.update({description});

      }

      // Add a placeholder to the first paragraph if necessary.
      if (descriptionContainer.textContent) {

        for (const child of descriptionContainer.children) {

          child.removeAttribute("placeholder");

        }

      } else {

        descriptionContainer.children[0].setAttribute("placeholder", "Add a description...");

      }

    }

  }

  const location = useLocation();
  const isLabelSelectorOpen = Boolean(matchPath("/:projectId/issues/:issueId/labels", location.pathname));
  const status = issue ? project.statuses.find((status) => status.id === issue.statusId) : undefined;
  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState<boolean>(false);
  if (issue && status) {

    const statusHexBG = status ? `#${status.backgroundColor.toString(16)}` : undefined;
    const statusHexFG = status ? `#${status.textColor.toString(16)}` : undefined;

    const updateStatus = async (newStatusId: string) => {

      // Update the current view.
      issue.statusId = newStatusId;
      setIssue(new Issue(structuredClone(issue), client));

    };

    return (
      <section id={styles.background} className={isOpen ? styles.open : undefined}>
        <LabelSelector isOpen={isLabelSelectorOpen} project={project} issue={issue} />
        <section id={styles.box}>
          <section id={styles.header}>
            <section id={styles.firstRow}>
              <section id={styles.options}>
                <button onClick={() => navigate(`/${project.id}/issues`)}>
                  <Icon name="arrow_back_ios" />
                </button>
              </section>
              <section id={styles.statusButtons}>
                <button onClick={async () => await updateStatus(status.nextStatusId)} style={{backgroundColor: statusHexBG, color: statusHexFG}}>
                  {status.name}
                </button>
                <section>
                  <button style={{backgroundColor: statusHexBG, color: statusHexFG}} onClick={() => setIsStatusSelectorOpen(!isStatusSelectorOpen)}>
                    <Icon name="expand_more" />
                  </button>
                  <section id={styles.statusSelector} className={isStatusSelectorOpen ? styles.visible : null} onClick={() => setIsStatusSelectorOpen(false)}>
                    <section onClick={(event) => event.stopPropagation()}>
                      <p>Select a status</p>
                      <ul>
                        {project.statuses.map((statusInfo) => (
                          <li key={statusInfo.id}>
                            <button onClick={async () => {

                              await updateStatus(statusInfo.id);
                              setIsStatusSelectorOpen(false);

                            }}>
                              <span>{statusInfo.name}</span>
                              {statusInfo.id === status.id ? <Icon name="done" /> : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </section>
                </section>
              </section>
            </section>
            <section id={styles.details}>
              <ul id={styles.labels}>
                {labelComponents}
                <li>
                  <button id={styles.labelAddButton} onClick={() => navigate(`/${project.id}/issues/${issue.id}/labels`)}>
                    <Icon name="add" />
                  </button>
                </li>
              </ul>
              <input type="text" value={newIssueName} onBlur={changeIssueName} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setNewIssueName(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? event.currentTarget.blur() : undefined} placeholder={issue.name} />
            </section>
          </section>
          <section id={styles.content}>
            <section>
              <label>Description</label>
              <section 
                tabIndex={-1} 
                ref={descriptionRef} 
                id={styles.description} 
                contentEditable 
                suppressContentEditableWarning 
                onKeyDown={updateDescription} 
                onKeyUp={updateDescription} 
                onBlur={updateDescription}
                onInput={updateDescription}>
                {
                  descriptionComponents[0] ? descriptionComponents : (
                    <p placeholder="Add a description...">
                      <br />
                    </p>
                  )
                }
              </section>
            </section>
            <section>
              <label>ID</label>
              <p>{issue.id}</p>
            </section>
            <ul id={styles.actions}>
              <li>
                <button className="destructive" onClick={deleteIssue}>Delete</button>
              </li>
            </ul>
          </section>
        </section>
      </section>
    );

  }

  return null;

}