import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import styles from "./IssueViewer.module.css";

export default function IssueViewer({ client, onIssueDelete }: { client: Client; onIssueDelete: (issueId: string) => void }) {

  const { issueId } = useParams<{ issueId: string }>();
  const [newIssueName, setNewIssueName] = useState<string>("");
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {

      if (issueId) {

        try {

          const newIssue = await client.getIssue(issueId);
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
            <input type="text" value={newIssueName} onBlur={changeIssueName} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setNewIssueName(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? event.currentTarget.blur() : undefined} placeholder={issue.name} />
            <label>The Showrunners</label>
          </section>
        </section>
        <section id={styles.content}>
          <section>
            <label>Description</label>
            <p>This issue has no description.</p>
          </section>
          <section>
            <label>Child issues</label>
            <p>This issue has no child issues.</p>
          </section>
          <section>
            <label>Activity</label>
            <p>Loading activity...</p>
          </section>
          <section>
            <label>Assignees</label>
            <p>This issue has no assignees.</p>
          </section>
          <section>
            <label>Labels</label>
            <ul id={styles.labels}>
              <li>Characters</li>
              <li>Dialogue</li>
            </ul>
            <p>This issue has no labels.</p>
          </section>
          <section>
            <label>Due date</label>
            <p>This issue doesn't have a due date.</p>
          </section>
          <section>
            <label>Status</label>
            <select>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </section>
          <section>
            <label>ID</label>
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