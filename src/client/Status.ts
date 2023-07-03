import Client, { PropertiesUpdate } from "./Client";

export interface StatusProperties {
  id: string;
  color?: number;
  description?: string;
  name: string;
  projects?: string[];
  nextStatusId?: string;
  localProjectId?: string;
}

export type InitialStatusProperties = Omit<StatusProperties, "id">;

export default class Status {

  static readonly tableName = "statuses" as const;
  
  /**
   * A reference to the client.
   * @since v1.1.0
   */
  readonly #client: Client;

  /**
   * This status' color.
   * @since v1.1.0
   */
  readonly color?: StatusProperties["color"];

  /**
   * This status' description.
   * @since v1.1.0
   */
  readonly description?: string;

  /**
   * This status' ID.
   * @since v1.1.0
   */
  readonly id: string;

  /**
   * This status' name.
   * @since v1.1.0
   */
  readonly name: string;

  /**
   * @since v1.1.0
   */
  readonly nextStatusId?: StatusProperties["nextStatusId"];

  readonly localProjectId?: StatusProperties["localProjectId"];

  constructor(props: StatusProperties, client: Client) {

    this.color = props.color;
    this.id = props.id;
    this.name = props.name;
    this.nextStatusId = props.nextStatusId;
    this.description = props.description;
    this.localProjectId;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteStatus(this.id);

  }

  async removeFromProject(projectId: string): Promise<void> {

    await this.#client.removeStatusFromProject(this.id, projectId);

  }

  async update(newProperties: PropertiesUpdate<StatusProperties>): Promise<void> {

    await this.#client.updateStatus(this.id, newProperties);

  }

}