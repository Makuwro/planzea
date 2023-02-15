import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
import IssueViewer from "../IssueViewer/IssueViewer";

export default function Backlog({client, project}: {client: Client, project: Project | null}) {

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueComponents, setIssueComponents] = useState<React.ReactElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {
      
      if (project) {

        setIssues(await project.getIssues());

      }
      
    })();

  }, [project]);

  useEffect(() => {

    (async () => {

      const newIssueComponents = [];
      for (const issue of issues) {

        newIssueComponents.push(
          <li key={issue.id}>
            <button onClick={() => navigate(`/issues/${issue.id}`)}>
              {issue.name}
            </button>
          </li>
        );

      }

      setIssueComponents(newIssueComponents);

    })();

  }, [issues]);

  async function createIssue() {

    const issue = await client.createIssue({
      name: "Unnamed issue",
      projects: []
    });

    setIssues([...issues, issue]);

  }

  return project ? (
    <>
      <IssueViewer client={client} onIssueDelete={(deletedIssueId) => setIssues(issues.filter((issue) => issue.id !== deletedIssueId))} project={project} />
      <main>
        <h1>{project.name}</h1>
        <button onClick={createIssue}>Create issue</button>
        <ul>
          {issueComponents}
        </ul>
      </main>
    </>
  ) : null;

}