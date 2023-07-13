import ProjectHistoryEntry, { ProjectHistoryEntryProperties } from "./ProjectHistoryEntry";

export default class ProjectCreateHistoryEntry extends ProjectHistoryEntry {

  constructor(props: ProjectHistoryEntryProperties) {

    super({
      ...props,
      actionType: "project.create"
    });

  }

}