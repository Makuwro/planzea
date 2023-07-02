import React, { ReactElement, useEffect, useState } from "react";
import CacheClient from "../../client/CacheClient";
import { SetState } from "../../App";
import { Link, useNavigate, useParams } from "react-router-dom";
import Project from "../../client/Project";
import Icon, { IconName } from "../Icon/Icon";
import LabelManagementPage from "../LabelManagementPage/LabelManagementPage";
import styles from "./SettingsPage.module.css";
import StatusManagementPage from "../StatusManagementPage/StatusManagementPage";

interface SettingsPageProperties {
  client: CacheClient;
  setDocumentTitle: SetState<string>;
}

export default function SettingsPage({client, setDocumentTitle}: SettingsPageProperties) {

  const [project, setProject] = useState<Project | null>(client.currentProject);
  const [navItems, setNavItems] = useState<{name: string; iconName: IconName; element: ReactElement}[]>([]);
  const [selectedNavIndex, setSelectedNavIndex] = useState<number>(0);
  const {projectId, settingName} = useParams<{projectId: string; settingName: string}>();

  const navigate = useNavigate();
  useEffect(() => {

    if (project && projectId) {

      const selectedNavIndex = navItems.findIndex((item) => settingName ? item.name.toLowerCase() === settingName.toLowerCase() : item.name === "Overview");
      setSelectedNavIndex(selectedNavIndex === -1 ? 0 : selectedNavIndex);
      if (selectedNavIndex === -1) {

        navigate(`/personal/projects/${projectId}/settings`, {replace: true});

      }

    }

  }, [project, projectId, navItems, settingName]);

  useEffect(() => {

    setNavItems([
      {
        name: "Overview",
        iconName: "info",
        element: (
          <section>
            <h1>Overview</h1>
          </section>
        )
      },
      {
        name: "Labels",
        iconName: "label",
        element: <LabelManagementPage client={client} project={project} setDocumentTitle={setDocumentTitle} />
      },
      {
        name: "Statuses",
        iconName: "done",
        element: <StatusManagementPage client={client} project={project} setDocumentTitle={setDocumentTitle} />
      }
    ]);

  }, [client, project]);

  useEffect(() => {

    (async () => {

      if (!client.currentProject && projectId) {

        client.setCurrentProject(await client.getProject(projectId));

      }

    })();

    const onCurrentProjectChange = (project: Project | null) => {

      setProject(project);

    };

    client.addEventListener("currentProjectChange", onCurrentProjectChange);

    return () => client.removeEventListener("currentProjectChange", onCurrentProjectChange);

  }, [client, projectId]);

  return project && navItems[0] && projectId ? (
    <main id={styles.main}>
      <nav id={styles.nav}>
        {
          navItems.map((item, index) => {
            
            const isSelected = selectedNavIndex === index;
            return (
              <Link className={`${styles.navItem}${isSelected ? ` ${styles.selected}` : ""}`} key={item.name} to={`/personal/projects/${project.id}/settings${item.name !== "Overview" ? `/${item.name.toLowerCase()}` : ""}`}>
                <span className={styles.marker} />
                <span className={styles.navItemText}>
                  <Icon name={item.iconName} />
                  <span>{item.name}</span>
                </span>
              </Link>
            );

          })
        }
      </nav>
      <section id={styles.page}>
        {navItems[selectedNavIndex !== -1 ? selectedNavIndex : 0].element}
      </section>
    </main>
  ) : null;

}