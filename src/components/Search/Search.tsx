import React, { ReactElement, useEffect, useState } from "react";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";
import styles from "./Search.module.css";

interface Result {
  name: ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
}

type Results = {
  name: string;
  items: Result[];
}[];

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
  const [results, setResults] = useState<Results | null>(null);
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
        setResults([
          {
            name: "Tasks",
            items: []
          },
          {
            name: "Actions",
            items: [
              {
                name: "Manage project settings",
                isDisabled: !currentProject,
                onClick: () => {
                  
                  if (currentProject) {
                    
                    const newPath = `/personal/projects/${currentProject.id}/settings`;
                    if (location.pathname !== newPath) {
                      
                      navigate(newPath);

                    }

                    setQuery("");

                  }
                  
                }
              }
            ]
          }
        ]);

      } else if (!query) {

        setResults(null);

      }

    })();

  }, [cache, query]);

  const [resultComponents, setResultComponents] = useState<ReactElement[]>([]);
  useEffect(() => {

    const comps = [];

    if (results) {

      for (const resultGroup of results) {

        if (resultGroup.items[0]) {

          comps.push(
            <section key={resultGroup.name}>
              <section>{resultGroup.name}</section>
              <ul>
                {
                  resultGroup.items.map((result, index) => (
                    <li key={index}>
                      <button onClick={result.onClick} disabled={result.isDisabled}>
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
      {
        results ? (
          <section id={styles.resultContainer}>
            {resultComponents[0] ? resultComponents : <p>Couldn't find anything</p>}
          </section>
        ) : null
      }
    </section>
  );

}