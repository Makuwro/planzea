import HistoryEntry, { HistoryEntryProperties } from "./HistoryEntry";

export type ProjectHistoryActionType = "project.create" | "project.delete" | "project.update";

export interface ProjectHistoryEntryProperties extends HistoryEntryProperties {
  projectId: string;
  actionType: ProjectHistoryActionType;
}

export default abstract class ProjectHistoryEntry extends HistoryEntry {

  /**
   * This history entry's project ID.
   * @since v1.0.0
   */
  readonly projectId: ProjectHistoryEntryProperties["projectId"];

  constructor(props: ProjectHistoryEntryProperties) {

    super(props);
    this.projectId = props.projectId;

  }

}