import Attachment, { InitialAttachmentProperties } from "./Attachment";
import { Mutable } from "./CacheClient";
import Client, { PropertiesUpdate } from "./Client";

export interface TaskList {
  name: string;
  taskIds: string[];
}

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
  taskLists?: TaskList[];
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
   * @deprecated v1.1.0
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
  readonly taskLists?: TaskList[];

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

  async getAttachments(): Promise<Attachment[]> {

    return await this.#client.getAttachments({taskIds: [this.id]});

  }

  async delete(shouldDeleteSubtasks = true) {

    await this.#client.deleteTask(this.id, shouldDeleteSubtasks);

  }

  async update(newProperties: PropertiesUpdate<TaskProperties>): Promise<void> {

    await this.#client.updateTask(this.id, newProperties);

  }

  /**
   * This method will be removed in v2.0.0.
   * @since v1.1.0
   */
  async upgradeParentTask(): Promise<void> {
    
    if (this.parentTaskId) {

      // Get the parent task.
      const parentTask = await this.#client.getTask(this.parentTaskId);

      // Create the default task list, if necessary.
      const taskLists = parentTask.taskLists ?? [];
      let taskList = taskLists.find((list) => list.name === "Tasks");
      const taskListIndex = taskList ? taskLists.indexOf(taskList) : taskLists.length - 1;
      if (!taskList) {

        taskList = {
          name: "Tasks",
          taskIds: []
        };

      }

      // Add this task to the list.
      taskList.taskIds.push(this.id);
      taskLists.splice(taskListIndex, 1, taskList);
      await parentTask.update({taskLists});

      // Remove the parentTaskId.
      await this.update({parentTaskId: undefined});
      (this as Mutable<Task>).parentTaskId = undefined;

    }

  }

}