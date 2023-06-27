import React, { ReactElement, useEffect, useState } from "react";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";

interface Result {
  name: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

type Results = {
  [key in "actions" | "projects" | "tasks"]: Result[];
};

export default function Search({currentProject, client}: {currentProject: Project | null; client: Client}) {

  // Get a cache of all projects.
  const [cache, setCache] = useState<{projects: Project[], tasks: Task[]} | null>(null);
  useEffect(() => {

    (async () => {

      setCache({
        projects: await client.getProjects(),
        tasks: await client.getTasks()
      });

    })();

  }, []);

  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  const [results, setResults] = useState<Results | null>({
    actions: [
      {
        name: "Delete project",
        disabled: Boolean(currentProject),
        onClick: () => navigate(`${location.pathname}?delete=project`)
      }
    ],
    projects: [],
    tasks: []
  });
  useEffect(() => {

    (async () => {

      if (cache && query) {

        // Get all related projects.
        // const expression = new RegExp(query, "gi");
        // const actions: Result = [
        //   {
        //     name: "Delete project",
        //     onClick: () => 
        //   }
        // ];

      } else if (!query) {

        // setResults(null);

      }

    })();

  }, [cache, query]);

  const [resultComponents, setResultComponents] = useState<ReactElement[]>([]);
  useEffect(() => {

    const comps = [];

    if (results) {

      for (const key of Object.keys(results) as (keyof typeof results)[]) {

        const keyResults = results[key];
        if (keyResults[0]) {

          comps.push(
            <section key={key}>
              <section>{key}</section>
              <ul>
                {
                  keyResults.map((result, index) => (
                    <li key={index}>
                      <button onClick={result.onClick} disabled={result.disabled}>
                        {result.name}
                      </button>
                    </li>
                  ))
                }
              </ul>
            </section>
          );

        }

      }

    }
    
    setResultComponents(comps);

  }, [results]);

  return (
    <section>
      <input type="text" placeholder="Search" value={query} onChange={({target: {value}}) => setQuery(value)} />
      <section>
        {resultComponents[0] ? resultComponents : <p>Couldn't find anything</p>}
      </section>
    </section>
  );

}