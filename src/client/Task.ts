import Attachment, { InitialAttachmentProperties } from "./Attachment";
import Client, { PropertiesUpdate } from "./Client";

export interface TaskProperties {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  isLocked?: boolean;
  labelIds: string[];
  parentTaskId?: string;
  projectId: string;
  statusId: string;
}

export type InitialTaskProperties = Omit<TaskProperties, "id">;

export default class Task {

  static readonly tableName = "tasks" as const;

  /**
   * A reference to the client.
   * @since v1.0.0
   */
  readonly #client: Client;

  /**
   * This task's ID.
   * @since v1.0.0
   */
  readonly id: string;
  
  /**
   * This task's name.
   * @since v1.0.0
   */
  name: string;

  /**
   * This task's description in Markdown.
   * @since v1.0.0
   */
  description?: string;

  /**
   * This task's due date represented in the number of milliseconds since epoch.
   * @since v1.0.0
   */
  dueDate?: string;

  /**
   * The lock status of this task. A task cannot be modified while it is locked.
   * @since v1.0.0
   */
  isLocked?: boolean;

  /**
   * This task's label IDs.
   * @since v1.0.0
   */
  labelIds: string[];

  /**
   * The ID of this task's parent task.
   * @since v1.0.0
   * @deprecated v1.1.0
   */
  parentTaskId?: string;

  /**
   * This task's project ID.
   * @since v1.0.0
   */
  projectId: string;

  /**
   * This task's status ID.
   * @since v1.0.0
   */
  statusId: string;

  constructor(props: TaskProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.dueDate = props.dueDate;
    this.projectId = props.projectId;
    this.labelIds = props.labelIds;
    this.parentTaskId = props.parentTaskId;
    this.isLocked = props.isLocked;
    this.statusId = props.statusId;
    this.#client = client;

  }

  async createAttachment(props: Omit<InitialAttachmentProperties, "taskIds">): Promise<Attachment> {

    return await this.#client.createAttachment({...props, taskIds: [this.id]});

  }

  async getAttachments(): Promise<Attachment[]> {

    return await this.#client.getAttachments({taskIds: [this.id]});

  }

  async delete(shouldDeleteSubtasks = true) {

    await this.#client.deleteTask(this.id, shouldDeleteSubtasks);

  }

  async update(newProperties: PropertiesUpdate<TaskProperties>): Promise<void> {

    await this.#client.updateTask(this.id, newProperties);

  }

}