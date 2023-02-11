import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import styles from "./IssueViewer.module.css";

export default function IssueViewer({ client, onIssueDelete }: { client: Client; onIssueDelete: (issueId: string) => void }) {

  const { issueId } = useParams<{ issueId: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {

      if (issueId) {

        try {

          const newIssue = await client.getIssue(issueId);
          setIssue(newIssue);
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

  return issue ? (
    <section id={styles.background} className={isOpen ? styles.open : undefined}>
      <section id={styles.box}>
        <section id={styles.header}>
          <section id={styles.options}>
            <button onClick={() => navigate("/")}>
              <span className="material-icons-round">
                arrow_back
              </span>
            </button>
            <button onClick={() => navigate("/")}>
              <span className="material-icons-round">
                close
              </span>
            </button>
          </section>
          <section id={styles.details}>
            <h1>{issue.name}</h1>
            <h2>The Showrunners</h2>
          </section>
        </section>
        <section id={styles.content}>
          <section>
            <h1>Description</h1>
            <p>This issue has no description.</p>
          </section>
          <section>
            <h1>Child issues</h1>
            <p>This issue has no child issues.</p>
          </section>
          <section>
            <h1>Activity</h1>
            <p>Loading activity...</p>
          </section>
          <section>
            <h1>Assignees</h1>
            <p>This issue has no assignees.</p>
          </section>
          <section>
            <h1>Labels</h1>
            <ul id={styles.labels}>
              <li>Characters</li>
              <li>Dialogue</li>
            </ul>
            <p>This issue has no labels.</p>
          </section>
          <section>
            <h1>Due date</h1>
            <p>This issue doesn't have a due date.</p>
          </section>
          <section>
            <h1>Status</h1>
            <select>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </section>
          <section>
            <h1>ID</h1>
            <p>{issue.id}</p>
          </section>
          <ul id={styles.actions}>
            <li>
              <button onClick={deleteIssue}>Delete</button>
            </li>
          </ul>
        </section>
      </section>
    </section>
  ) : null;

}