import React, { ReactElement, useEffect, useState } from "react";
import CacheClient from "../../client/CacheClient";
import { SetState } from "../../App";
import { Link, useNavigate, useParams } from "react-router-dom";
import Project from "../../client/Project";
import Icon, { IconName } from "../Icon/Icon";
import LabelManagementPage from "../LabelManagementPage/LabelManagementPage";
import styles from "./SettingsPage.module.css";

interface SettingsPageProperties {
  client: CacheClient;
  setDocumentTitle: SetState<string>;
}

export default function SettingsPage({client, setDocumentTitle}: SettingsPageProperties) {

  const [project, setProject] = useState<Project | null>(client.currentProject);
  const [navItems, setNavItems] = useState<{name: string; iconName: IconName; element: ReactElement}[]>([]);
  const [selectedNavIndex, setSelectedNavIndex] = useState<number>(-1);
  const {projectId, settingName} = useParams<{projectId: string; settingName: string}>();

  const navigate = useNavigate();
  useEffect(() => {

    if (project && settingName && projectId) {

      const selectedNavIndex = navItems.findIndex((item) => item.name !== "Overview" && item.name.toLowerCase() === settingName.toLowerCase());
      setSelectedNavIndex(selectedNavIndex);
      if (selectedNavIndex === -1) {

        navigate(`/personal/projects/${projectId}/settings`, {replace: true});

      }

    }

  }, [project, projectId, navItems, settingName]);

  useEffect(() => {

    setNavItems([
      {
        name: "Overview",
        iconName: "folder",
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
      <nav>
        {
          navItems.map((item) => (
            <Link key={item.name} to={`/personal/projects/${project.id}/settings${item.name !== "Overview" ? `/${item.name.toLowerCase()}` : ""}`}>
              <Icon name={item.iconName} />
              <span>{item.name}</span>
            </Link>
          ))
        }
      </nav>
      {navItems[selectedNavIndex !== -1 ? selectedNavIndex : 0].element}
    </main>
  ) : null;

}