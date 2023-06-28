import React, { ReactElement, useEffect, useState } from "react";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";
import styles from "./Search.module.css";
import Icon from "../Icon/Icon";
import UIClient from "../../client/UIClient";

interface Result {
  name: string;
  isDisabled?: boolean;
  onClick: () => void;
}

type Results = {
  name: string;
  items: Result[];
}[];

export default function Search({client, onMobileSearchChange, uiClient}: {client: Client; onMobileSearchChange: (isMobileSearching: boolean) => void; uiClient: UIClient}) {

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

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [currentProjectTasks, setCurrentProjectTasks] = useState<Task[]>([]);
  useEffect(() => {

    (async () => {

      if (uiClient.currentProject) {

        setCurrentProjectTasks(await uiClient.currentProject.getTasks());

      }

    })();

    const onCurrentProjectChange = (project: Project | null) => {

      (async () => {

        if (project) {

          // Get the tasks.
          setCurrentProjectTasks(await project.getTasks());

        } else {

          setCurrentProjectTasks([]);

        }

      })();

    };
    const onTaskBacklogSelectionChange = (tasks: Task[]) => {
      
      setSelectedTaskIds(tasks.map((task) => task.id));

    };

    uiClient.addEventListener("currentProjectChange", onCurrentProjectChange);
    uiClient.addEventListener("taskBacklogSelectionChange", onTaskBacklogSelectionChange);

    return () => {
      
      uiClient.removeEventListener("currentProjectChange", onCurrentProjectChange);
      uiClient.removeEventListener("taskBacklogSelectionChange", onTaskBacklogSelectionChange);

    };

  }, [uiClient]);


  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  const [results, setResults] = useState<Results | null>(null);
  useEffect(() => {

    (async () => {

      if (cache && query) {

        // Get all related projects.
        const escapedQuery = query.toLocaleLowerCase().replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
        const projectId = uiClient.currentProject?.id;
        const navigateIfNotAlreadyThere = (path: string) => {

          if (location.pathname !== path) {

            navigate(path);

          }

        };
        const navigateIfProjectExists = (path: string) => {

          if (projectId) {

            navigateIfNotAlreadyThere(path);

          }

        };
        
        // Let's filter the tasks.
        const itemFilter = (action: Result) => action.name.toLocaleLowerCase().match(escapedQuery);
        const itemSort = (resultA: Result, resultB: Result) => {

          // Sort tasks by direct match.
          const resultALC = resultA.name.toLocaleLowerCase();
          const resultBLC = resultB.name.toLocaleLowerCase();
          const queryLC = escapedQuery.toLocaleLowerCase();
          if (resultALC === queryLC) {

            return -1;

          } else if (resultBLC === queryLC) {

            return 1;

          }

          return 0;

        };
        const taskResults = currentProjectTasks.map((task) => (
          {
            name: task.name,
            onClick: () => navigate(`/personal/projects/${projectId}/tasks/${task.id}`)
          }
        )).filter(itemFilter).sort(itemSort).splice(0, 4);

        setResults([
          {
            name: "Tasks",
            items: taskResults
          },
          {
            name: "Actions",
            items: [
              {
                name: "Create project",
                onClick: () => navigateIfNotAlreadyThere(`${location.pathname}?create=project`)
              },
              {
                name: "Create task",
                isDisabled: !projectId,
                onClick: () => navigateIfProjectExists(`${location.pathname}?create=task`)
              },
              {
                name: "Delete project",
                isDisabled: !projectId,
                onClick: () => navigateIfProjectExists(`${location.pathname}?delete=project&id=${projectId}`)
              },
              {
                name: "Delete task",
                isDisabled: !selectedTaskIds[0],
                onClick: () => selectedTaskIds[0] ? navigateIfProjectExists(`${location.pathname}?delete=task&id=${selectedTaskIds[0]}`) : undefined
              },
              {
                name: "Manage project settings",
                isDisabled: !projectId,
                onClick: () => navigateIfProjectExists(`/personal/projects/${projectId}/settings`)
              }
            ].filter(itemFilter).sort(itemSort).splice(0, 4)
          }
        ]);

      } else if (!query) {

        setResults(null);

      }

    })();

  }, [currentProjectTasks, selectedTaskIds, cache, query]);

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