import React, { useState, useEffect, useRef, ReactElement } from "react";
import { useParams, useNavigate, useLocation, matchPath } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
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

  const [isDescriptionEmpty, setIsDescriptionEmpty] = useState<boolean>(true);
  useEffect(() => {

    (async () => {

      if (issueId) {

        try {

          // Create label components
          const newIssue = await client.getIssue(issueId);
          const projectLabels = await project.getLabels();
          const newLabelComponents = [];
          for (const labelId of (newIssue.labels ?? [])) {

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
                  <p key={descriptionComponents.length} tabIndex={-1} placeholder="Add a description...">
                    {paragraph}
                  </p>
                );

              }

            }
            setIsDescriptionEmpty(!descriptionComponents[0]);
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
  async function updateDescription(event: React.FocusEvent | React.KeyboardEvent) {

    if (issue && descriptionRef.current) {

      let description = "";

      for (const node of descriptionRef.current.childNodes) {

        if (node.textContent?.trim()) {

          description += `${node.textContent}\n`;
        
        }

      }
      setIsDescriptionEmpty(!description);

      if (event.type === "keydown" && "key" in event && event.key === "Backspace") {

        const selection = document.getSelection();
        const anchorNode = selection?.anchorNode;
        const anchorParentElement = anchorNode?.parentElement;
        const focusParentElement = selection?.focusNode?.parentElement;
        if (
          anchorParentElement && anchorParentElement === focusParentElement && // Is the user selecting multiple paragraphs?
          descriptionRef.current === anchorParentElement && anchorNode instanceof Element && [...descriptionRef.current.children].indexOf(anchorNode) === 0 && selection?.anchorOffset === 0 && selection.focusOffset === 0
        ) {

          event.preventDefault();
          return;

        }

      }

      if (description !== issue.description) {

        await issue.update({description});

      }

    }

  }

  const location = useLocation();
  const isLabelSelectorOpen = Boolean(matchPath("/:projectId/issues/:issueId/labels", location.pathname));
  return issue ? (
    <section id={styles.background} className={isOpen ? styles.open : undefined}>
      <LabelSelector isOpen={isLabelSelectorOpen} project={project} issue={issue} />
      <section id={styles.box}>
        <section id={styles.header}>
          <section id={styles.firstRow}>
            <section id={styles.options}>
              <button onClick={() => navigate(`/${project.id}/issues`)}>
                <span className="material-icons-round">
                  arrow_back_ios
                </span>
              </button>
            </section>
            <ul id={styles.assignees}>
              <li>
                <button>
                  <span className="material-icons-round">
                    person_add_alt
                  </span>
                </button>
              </li>
            </ul>
          </section>
          <section id={styles.details}>
            <ul id={styles.labels}>
              {labelComponents}
              <li>
                <button id={styles.labelAddButton} onClick={() => navigate(`/${project.id}/issues/${issue.id}/labels`)}>
                  <span className="material-icons-round">
                    add
                  </span>
                </button>
              </li>
            </ul>
            <input type="text" value={newIssueName} onBlur={changeIssueName} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setNewIssueName(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? event.currentTarget.blur() : undefined} placeholder={issue.name} />
          </section>
        </section>
        <section id={styles.content}>
          <section>
            <label>Description</label>
            <section tabIndex={-1} className={isDescriptionEmpty ? styles.empty : undefined} ref={descriptionRef} id={styles.description} contentEditable suppressContentEditableWarning onKeyDown={updateDescription} onKeyUp={updateDescription} onBlur={updateDescription}>
              {descriptionComponents[0] ? descriptionComponents : <p placeholder="Add a description..."><br /></p>}
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
  ) : null;

}