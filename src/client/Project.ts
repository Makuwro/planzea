import Client, { Optional, PropertiesUpdate } from "./Client";
import Issue, { InitialIssueProperties } from "./Issue";
import Label, { InitialLabelProperties } from "./Label";

export interface StatusProperties {
  id: string;
  name: string;
  backgroundColor: number;
  textColor: number;
  nextStatusId: string;
}

export const defaultStatuses: StatusProperties[] = [
  {
    id: "dns",
    name: "Not Started",
    backgroundColor: 15527148,
    textColor: 6251368,
    nextStatusId: "dip"
  },
  {
    id: "dip",
    name: "In Progress",
    backgroundColor: 5412849,
    textColor: 16777215,
    nextStatusId: "dc"
  },
  {
    id: "dc",
    name: "Completed",
    backgroundColor: 3055966,
    textColor: 16777215,
    nextStatusId: "dns"
  }
];

export interface ProjectProperties {
  id: string;
  name: string;
  defaultStatusId: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  statuses: StatusProperties[];
}

export type InitialProjectProperties = Omit<ProjectProperties, "id" | "statuses" | "defaultStatusId">;

export default class Project {

  static readonly tableName = "projects" as const;
  
  readonly id: string;
  name: string;
  defaultStatusId: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  statuses: StatusProperties[];
  #client: Client;

  constructor(props: ProjectProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.defaultStatusId = props.defaultStatusId;
    this.isArchived = props.isArchived;
    this.isRecycled = props.isRecycled;
    this.statuses = props.statuses;
    this.#client = client;

  }

  async createIssue(props: Optional<Omit<InitialIssueProperties, "projects">, "statusId" | "projectId">): Promise<Issue> {

    return await this.#client.createIssue({
      ...props, 
      statusId: props.statusId ?? this.defaultStatusId, 
      projectId: this.id
    });

  }

  async createLabel(props: Omit<InitialLabelProperties, "projects">): Promise<Label> {

    return await this.#client.createLabel({...props, projects: [this.id]});

  }

  async delete(): Promise<void> {

    await this.#client.deleteProject(this.id);

  }

  async getIssues(): Promise<Issue[]> {

    return this.#client.getIssues({projectId: this.id});

  }

  async getLabels(): Promise<Label[]> {

    return this.#client.getLabels({projects: [this.id]});

  }

  async update(newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#client.updateProject(this.id, newProperties);
    
  }

}