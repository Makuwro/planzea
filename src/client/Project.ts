import Client, { Optional, PropertiesUpdate } from "./Client";
import Issue, { InitialIssueProperties } from "./Issue";
import Label, { InitialLabelProperties } from "./Label";

export interface StatusProperties {
  id: string;
  name: string;
  color: number;
}

export const defaultStatuses: StatusProperties[] = [
  {
    id: "dns",
    name: "Not Started",
    color: 15527148
  },
  {
    id: "dip",
    name: "In Progress",
    color: 5412849
  },
  {
    id: "dc",
    name: "Completed",
    color: 3055966
  }
];

export interface ProjectProperties {
  id: string;
  name: string;
  defaultStatus: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  statuses: StatusProperties[];
}

export type InitialProjectProperties = Omit<ProjectProperties, "id" | "statuses" | "defaultStatus">;

export default class Project {

  static readonly tableName = "projects" as const;
  
  readonly id: string;
  name: string;
  defaultStatus: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  statuses: StatusProperties[];
  #client: Client;

  constructor(props: ProjectProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.defaultStatus = props.defaultStatus;
    this.isArchived = props.isArchived;
    this.isRecycled = props.isRecycled;
    this.statuses = props.statuses;
    this.#client = client;

  }

  async createIssue(props: Optional<Omit<InitialIssueProperties, "projects">, "status">): Promise<Issue> {

    return await this.#client.createIssue({
      ...props, 
      status: props.status ?? this.defaultStatus, 
      projects: [this.id]
    });

  }

  async createLabel(props: Omit<InitialLabelProperties, "projects">): Promise<Label> {

    return await this.#client.createLabel({...props, projects: [this.id]});

  }

  async delete(): Promise<void> {

    await this.#client.deleteProject(this.id);

  }

  async getIssues(): Promise<Issue[]> {

    return this.#client.getIssues({projects: [this.id]});

  }

  async getLabels(): Promise<Label[]> {

    return this.#client.getLabels({projects: [this.id]});

  }

  async update(newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#client.updateProject(this.id, newProperties);
    
  }

}