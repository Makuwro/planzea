import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Issue from "../../client/Issue";
import IssueViewer from "../IssueViewer/IssueViewer";

export default function Backlog({client}: {client: Client}) {

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueComponents, setIssueComponents] = useState<React.ReactElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {

    (async () => setIssues(await client.getIssues()))();

  }, []);

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

  return (
    <>
      <IssueViewer client={client} onIssueDelete={(deletedIssueId) => setIssues(issues.filter((issue) => issue.id !== deletedIssueId))} />
      <main>
        <h1>Unnamed project</h1>
        <button onClick={createIssue}>Create issue</button>
        <ul>
          {issueComponents}
        </ul>
      </main>
    </>
  );

}