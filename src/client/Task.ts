import Attachment, { InitialAttachmentProperties } from "./Attachment";
import Client, { PropertiesUpdate } from "./Client";
import TaskList, { InitialTaskListProperties, TaskListProperties } from "./TaskList";

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
  taskLists?: TaskListProperties[];
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
  readonly name: string;

  /**
   * This task's description in Markdown.
   * @since v1.0.0
   */
  readonly description?: string;

  /**
   * This task's due date represented in the number of milliseconds since epoch.
   * @since v1.0.0
   */
  readonly dueDate?: string;

  /**
   * The lock status of this task. A task cannot be modified while it is locked.
   * @since v1.0.0
   */
  readonly isLocked?: boolean;

  /**
   * This task's label IDs.
   * @since v1.0.0
   */
  readonly labelIds: string[];

  /**
   * The ID of this task's parent task.
   * @since v1.0.0
   * @deprecated since v1.1.0. Removing in v2.0.0.
   */
  readonly parentTaskId?: string;

  /**
   * This task's project ID.
   * @since v1.0.0
   */
  readonly projectId: string;

  /**
   * This task's status ID.
   * @since v1.0.0
   */
  readonly statusId: string;

  /**
   * This task's task lists.
   * @since v1.0.0
   */
  readonly taskLists?: TaskListProperties[];

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
    this.taskLists = props.taskLists;
    this.#client = client;

  }

  async createAttachment(props: Omit<InitialAttachmentProperties, "taskIds">): Promise<Attachment> {

    return await this.#client.createAttachment({...props, taskIds: [this.id]});

  }

  async createTaskList(props?: InitialTaskListProperties): Promise<TaskList> {

    const taskList = await this.#client.createTaskList(props);
    const taskLists = this.taskLists ?? [];
    taskLists.push(taskList);
    await this.update({taskLists});

    return taskList;

  }

  async getAttachments(): Promise<Attachment[]> {

    return (await this.#client.getAttachments()).filter((possibleTaskAttachment) => possibleTaskAttachment.taskIds.includes(this.id));

  }

  async delete() {

    await this.#client.deleteTask(this.id);

  }

  async update(newProperties: PropertiesUpdate<TaskProperties>): Promise<void> {

    await this.#client.updateTask(this.id, newProperties);

  }

}