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
          <section id={styles.firstRow}>
            <section id={styles.options}>
              <button onClick={() => navigate("/")}>
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
              <li>
                <button>Characters</button>
              </li>
              <li>
                <button>Dialogue</button>
              </li>
              <li>
                <button id={styles.labelAddButton}>
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