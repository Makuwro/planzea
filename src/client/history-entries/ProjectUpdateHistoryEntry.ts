import { PropertiesUpdate } from "../Client";
import { ProjectProperties } from "../Project";
import ProjectHistoryEntry, { ProjectHistoryEntryProperties } from "./ProjectHistoryEntry";

export interface ProjectUpdateHistoryEntryProperties extends ProjectHistoryEntryProperties {
  newProjectProperties: PropertiesUpdate<ProjectProperties>;
}

export type InitialProjectUpdateHistoryEntryProperties = Omit<ProjectUpdateHistoryEntryProperties, "id">;

export default class ProjectUpdateHistoryEntry extends ProjectHistoryEntry {

  readonly newProjectProperties: ProjectUpdateHistoryEntryProperties["newProjectProperties"];

  constructor(props: ProjectUpdateHistoryEntryProperties) {

    super({
      ...props,
      actionType: "project.update"
    });
    this.newProjectProperties = props.newProjectProperties;

  }

}