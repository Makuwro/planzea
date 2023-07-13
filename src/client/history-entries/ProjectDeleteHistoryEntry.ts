import ProjectHistoryEntry, { ProjectHistoryEntryProperties } from "./ProjectHistoryEntry";

export default class ProjectDeleteHistoryEntry extends ProjectHistoryEntry {

  constructor(props: ProjectHistoryEntryProperties) {

    super({
      ...props,
      actionType: "project.delete"
    });

  }

}