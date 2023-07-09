import Client, { Optional, PropertiesUpdate } from "./Client";

export interface TaskListProperties {
  id: string;
  name: string;
  taskIds: string[];
}

export type InitialTaskListProperties = Optional<Omit<TaskListProperties, "id">, "name" | "taskIds">;

export default class TaskList {

  static readonly tableName = "taskLists" as const;

  readonly #client: Client;

  readonly id: TaskListProperties["id"];

  readonly name: TaskListProperties["name"];
  
  readonly taskIds: TaskListProperties["taskIds"];

  constructor(props: TaskListProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.taskIds = props.taskIds;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteTaskList(this.id);

  }

  async update(newProperties: PropertiesUpdate<TaskListProperties>): Promise<void> {

    await this.#client.updateTaskList(this.id, newProperties);

  }

}