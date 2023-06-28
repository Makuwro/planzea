import React, { ReactElement, useEffect, useRef, useState } from "react";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";
import styles from "./Search.module.css";
import Icon from "../Icon/Icon";
import CacheClient from "../../client/CacheClient";

interface Result {
  name: string;
  isDisabled?: boolean;
  onClick: () => void;
}

type Results = {
  name: string;
  isTop?: boolean;
  items: Result[];
}[];

export default function Search({client, onMobileSearchChange}: {client: CacheClient; onMobileSearchChange: (isMobileSearching: boolean) => void}) {

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [currentProjectTasks, setCurrentProjectTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {

    (async () => {

      if (client.currentProject) {

        setCurrentProjectTasks(await client.currentProject.getTasks());

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

    const onProjectsArrayChange = (projects: Project[]) => {

      setProjects(projects);

    };

    const onTaskBacklogSelectionChange = (tasks: Task[]) => {
      
      setSelectedTaskIds(tasks.map((task) => task.id));

    };

    client.addEventListener("currentProjectChange", onCurrentProjectChange);
    client.addEventListener("projectsArrayChange", onProjectsArrayChange);
    client.addEventListener("taskBacklogSelectionChange", onTaskBacklogSelectionChange);

    return () => {
      
      client.removeEventListener("currentProjectChange", onCurrentProjectChange);
      client.removeEventListener("projectsArrayChange", onProjectsArrayChange);
      client.removeEventListener("taskBacklogSelectionChange", onTaskBacklogSelectionChange);

    };

  }, [client]);

  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  const [results, setResults] = useState<Results | null>(null);
  useEffect(() => {

    (async () => {

      if (query) {

        // Get all related projects.
        const escapedQuery = query.toLocaleLowerCase().replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
        const projectId = client.currentProject?.id;
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

        setResults([
          {
            name: "Tasks",
            isTop: Boolean(client.currentProject),
            items: currentProjectTasks.map((task) => (
              {
                name: task.name,
                onClick: () => navigate(`/personal/projects/${projectId}/tasks/${task.id}`)
              }
            )).filter(itemFilter).sort(itemSort).splice(0, 4)
          },
          {
            name: "Projects",
            isTop: location.pathname === "/",
            items: projects.map((project) => (
              {
                name: project.name,
                onClick: () => navigate(`/personal/projects/${project.id}/tasks`)
              }
            )).filter(itemFilter).sort(itemSort).splice(0, 4)
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

  }, [currentProjectTasks, selectedTaskIds, query]);

  const [resultComponents, setResultComponents] = useState<ReactElement[]>([]);
  useEffect(() => {

    const comps = [];

    if (results) {

      for (const resultGroup of results) {

        if (resultGroup.items[0]) {

          comps.push(
            <section key={resultGroup.name}>
              {!resultGroup.isTop ? <h1>{resultGroup.name}</h1> : null}
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

  const [areResultsShown, setAreResultsShown] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLElement>(null);
  useEffect(() => {

    const checkForOutsideClick = (event: MouseEvent) => {

      if (event.target && !searchContainerRef.current?.contains(event.target as Node)) {

        setAreResultsShown(false);

      }

    };

    window.addEventListener("click", checkForOutsideClick);

    return () => window.removeEventListener("click", checkForOutsideClick);

  }, []);

  return (
    <section className={isOpen ? styles.open : undefined}>
      <button id={styles.searchButton} onClick={() => setIsOpen(true)}>
        <Icon name="search" />
      </button>
      <section ref={searchContainerRef}>
        <section id={styles.inputContainer}>
          <input id={styles.input} onClick={() => setAreResultsShown(true)} type="text" placeholder="Search" value={query} onChange={({target: {value}}) => {
            
            setAreResultsShown(true);
            setQuery(value);
          
          }} />
          <button id={styles.closeButton} onClick={() => setIsOpen(false)}>
            <Icon name="close" />
          </button>
        </section>
        {
          results && areResultsShown ? (
            <section id={styles.resultContainer}>
              {resultComponents[0] ? resultComponents : <p>Couldn't find anything</p>}
            </section>
          ) : null
        }
      </section>
    </section>
  );

}