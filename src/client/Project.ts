import Client, { Optional, PropertiesUpdate } from "./Client";
import Issue, { InitialTaskProperties } from "./Task";
import Label, { InitialLabelProperties } from "./Label";
import Task from "./Task";
import Status, { InitialStatusProperties } from "./Status";

interface DeprecatedStatusProperties {
  id: string;
  name: string;
  backgroundColor: number;
  textColor: number;
  nextStatusId: string;
}

export interface ProjectProperties {
  id: string;
  name: string;
  defaultStatusId?: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  labelIds: string[];
  statuses?: DeprecatedStatusProperties[];
  statusIds: string[];
}

export type InitialProjectProperties = Optional<Omit<ProjectProperties, "id" | "statuses" | "defaultStatusId">, "statusIds" | "labelIds">;

export default class Project {

  static readonly tableName = "projects" as const;
  
  /**
   * @since v1.0.0
   */
  readonly #client: Client;

  /**
   * @since v1.0.0
   */
  readonly id: string;
  
  /**
   * @since v1.0.0
   */
  readonly name: string;
  
  /**
   * @since v1.0.0
   * @deprecated since v1.1.0. Removing in v2.0.0.
   */
  readonly defaultStatusId?: string;
  
  /**
   * @since v1.0.0
   */
  readonly description?: string;
  
  /**
   * @since v1.0.0
   */
  readonly isArchived?: boolean;
  
  /**
   * @since v1.0.0
   */
  readonly isRecycled?: boolean;

  /**
   * 
   */
  readonly labelIds: ProjectProperties["labelIds"];

  /**
   * @since v1.0.0
   * @deprecated since v1.1.0. Removing in v2.0.0.
   */
  readonly statuses?: DeprecatedStatusProperties[];

  /**
   * @since v1.1.0
   */
  readonly statusIds: string[];

  constructor(props: ProjectProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.defaultStatusId = props.defaultStatusId;
    this.isArchived = props.isArchived;
    this.isRecycled = props.isRecycled;
    this.labelIds = props.labelIds;
    this.statuses = props.statuses;
    this.statusIds = props.statusIds;
    this.#client = client;

  }

  async createLabel(props: Omit<InitialLabelProperties, "projects">): Promise<Label> {

    return await this.#client.createLabel({...props, projects: [this.id]});

  }

  async createStatus(props: InitialStatusProperties): Promise<Status> {

    // Create the status.
    const status = await this.#client.createStatus(props);
    
    // Add the status to the project.
    await this.update({statusIds: [...this.statusIds, status.id]});

    // Return the status.
    return status;

  }

  async createTask(props: Optional<Omit<InitialTaskProperties, "projects">, "statusId" | "projectId" | "labelIds">): Promise<Task> {

    return await this.#client.createTask({
      ...props, 
      statusId: this.statusIds[0], 
      labelIds: props.labelIds ?? [],
      projectId: this.id
    });

  }

  async delete(): Promise<void> {

    await this.#client.deleteProject(this.id);

  }

  async getTasks(): Promise<Issue[]> {

    return (await this.#client.getTasks()).filter((possibleProjectTask) => possibleProjectTask.projectId === this.id);

  }

  async getLabels(): Promise<Label[]> {

    const labels = [];
    for (const labelId of this.labelIds) {

      labels.push(await this.#client.getLabel(labelId));

    }
    return labels;

  }

  async getStatuses(): Promise<Status[]> {

    const statuses = [];
    for (const statusId of this.statusIds) {

      statuses.push(await this.#client.getStatus(statusId));

    }
    return statuses;

  }

  async update(newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#client.updateProject(this.id, newProperties);
    
  }

}