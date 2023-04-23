import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
import IssueViewer from "../IssueViewer/IssueViewer";
import styles from "../ProjectSelector/ProjectSelector.module.css";
import Icon from "../Icon/Icon";

export default function Backlog({client, project}: {client: Client, project: Project | null}) {

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueComponents, setIssueComponents] = useState<React.ReactElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {
      
      if (project) {

        setIssues((await project.getIssues()).filter((issue) => !issue.parentIssueId));

      }
      
    })();

  }, [project]);

  useEffect(() => {

    (async () => {

      if (project) {

        const newIssueComponents = [];
        for (const issue of issues) {

          newIssueComponents.push(
            <li key={issue.id}>
              <button onClick={() => navigate(`/${project.id}/issues/${issue.id}`)}>
                {issue.name}
              </button>
            </li>
          );

        }

        setIssueComponents(newIssueComponents);

      }

    })();

  }, [project, issues]);

  async function createIssue() {

    if (project) {

      const issue = await project.createIssue({name: "Unnamed issue"});
      setIssues([...issues, issue]);

    }

  }

  return project ? (
    <>
      <IssueViewer client={client} onIssueDelete={(deletedIssueId) => setIssues(issues.filter((issue) => issue.id !== deletedIssueId))} project={project} />
      <main id={styles.main}>
        <section id={styles.headingContainer}>
          <button onClick={() => navigate("/")}>
            <Icon name="arrow_back_ios" />
          </button>
          <h1>{project.name}</h1>
          <button onClick={createIssue}>Create issue</button>
        </section>
        <ul>
          {issueComponents}
        </ul>
      </main>
    </>
  ) : null;

}