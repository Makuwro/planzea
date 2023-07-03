import Client, { PropertiesUpdate } from "./Client";

export interface StatusProperties {
  backgroundColor?: number;
  id: string;
  name: string;
  description?: string;
  projects?: string[];
  textColor?: number;
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
   * This status' background color.
   * @since v1.1.0
   */
  readonly backgroundColor?: number;

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

  /**
   * This status' text color.
   * @since v1.1.0
   */
  readonly textColor?: number;

  constructor(props: StatusProperties, client: Client) {

    this.backgroundColor = props.backgroundColor;
    this.id = props.id;
    this.name = props.name;
    this.nextStatusId = props.nextStatusId;
    this.description = props.description;
    this.textColor = props.textColor;
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