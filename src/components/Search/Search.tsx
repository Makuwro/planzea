import React, { ReactElement, useEffect, useState } from "react";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";
import styles from "./Search.module.css";
import Icon from "../Icon/Icon";

interface Result {
  name: ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
}

type Results = {
  name: string;
  items: Result[];
}[];

export default function Search({currentProject, client, onMobileSearchChange}: {currentProject: Project | null; client: Client; onMobileSearchChange: (isMobileSearching: boolean) => void}) {

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
        const escapedQuery = query.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
        const quantifier = escapedQuery.length - 1;
        const expression = new RegExp(`(?=[${escapedQuery}]{${quantifier > 0 ? quantifier : 1},})${escapedQuery.split("").join("?")}?`, "gi");
        setResults([
          {
            name: "Tasks",
            items: [
              {
                name: "Test",
                onClick: () => {

                  return null;

                }
              }
            ]
          },
          {
            name: "Actions",
            items: [
              {
                name: "Create project",
                onClick: () => {
                    
                  const newPath = `${location.pathname}?create=project`;
                  if (location.pathname !== newPath) {
                    
                    navigate(newPath);

                  }

                }
              },
              {
                name: "Manage project settings",
                isDisabled: !currentProject,
                onClick: () => {
                  
                  if (currentProject) {
                    
                    const newPath = `/personal/projects/${currentProject.id}/settings`;
                    if (location.pathname !== newPath) {
                      
                      navigate(newPath);

                    }

                  }
                  
                }
              }
            ].filter((action) => action.name.match(expression)).splice(0, 4)
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
              <h1>{resultGroup.name}</h1>
              <ul>
                {
                  resultGroup.items.map((result, index) => (
                    <li key={index}>
                      <button onClick={() => {
                        
                        result.onClick();
                        setQuery("");
                      
                      }} disabled={result.isDisabled}>
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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {

    onMobileSearchChange(isOpen);

  }, [isOpen]);

  return (
    <section className={isOpen ? styles.open : undefined}>
      <button id={styles.searchButton} onClick={() => setIsOpen(true)}>
        <Icon name="search" />
      </button>
      <section>
        <section id={styles.inputContainer}>
          <input id={styles.input} type="text" placeholder="Search" value={query} onChange={({target: {value}}) => setQuery(value)} />
          <button id={styles.closeButton} onClick={() => setIsOpen(false)}>
            <Icon name="close" />
          </button>
        </section>
        {
          results ? (
            <section id={styles.resultContainer}>
              {resultComponents[0] ? resultComponents : <p>Couldn't find anything</p>}
            </section>
          ) : null
        }
      </section>
    </section>
  );

}