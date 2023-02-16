import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, matchPath } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
import LabelSelector from "../LabelSelector/LabelSelector";
import styles from "./IssueViewer.module.css";

export default function IssueViewer({ client, onIssueDelete, project }: { client: Client; onIssueDelete: (issueId: string) => void; project: Project }) {

  const { issueId } = useParams<{ issueId: string }>();
  const [newIssueName, setNewIssueName] = useState<string>("");
  const [labelComponents, setLabelComponents] = useState<React.ReactElement[]>([]);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {

      if (issueId) {

        try {

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
            <section id={styles.description} contentEditable suppressContentEditableWarning>
              <p placeholder="This issue has no description">
                <br />
              </p>
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