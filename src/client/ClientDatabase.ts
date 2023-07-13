import Dexie, { Table } from "dexie";
import { AttachmentProperties } from "./Attachment.js";
import { TaskProperties } from "./Task.js";
import { LabelProperties } from "./Label.js";
import { ProjectProperties } from "./Project.js";
import { TaskListProperties } from "./TaskList.js";
import { StatusProperties } from "./Status.js";
import { HistoryEntryProperties } from "./history-entries/HistoryEntry.js";
import { ProjectHistoryEntryProperties } from "./history-entries/ProjectHistoryEntry.js";
import { ProjectUpdateHistoryEntryProperties } from "./history-entries/ProjectUpdateHistoryEntry.js";

export class ClientDatabase extends Dexie {

  readonly attachments!: Table<AttachmentProperties>;
  readonly labels!: Table<LabelProperties>;
  readonly settings!: Table<string>;
  readonly statuses!: Table<StatusProperties>;
  readonly tasks!: Table<TaskProperties>;
  readonly taskLists!: Table<TaskListProperties>;
  readonly projects!: Table<ProjectProperties>;
  readonly history!: Table<HistoryEntryProperties | ProjectHistoryEntryProperties | ProjectUpdateHistoryEntryProperties>;

  constructor() {

    super("contents");

    this.version(2).stores({
      attachments: "&id, name",
      labels: "&id, name",
      settings: ",personalProjectId",
      statuses: "&id, name, description",
      tasks: "&id, dueDate, name, description, status",
      taskLists: "&id, taskIds",
      projects: "&id, name, description",
    });

  }

}

const db = new ClientDatabase();

export default db;