import Client, { PropertiesUpdate } from "./Client";

export interface StatusProperties {
  id: string;
  name: string;
  description?: string;
  projects?: string[];
  color?: string;
}

export type InitialStatusProperties = Omit<StatusProperties, "id">;

export default class Status {

  static readonly tableName = "statuses" as const;
  
  /**
   * A reference to the client.
   * @since v1.0.0
   */
  readonly #client: Client;

  /**
   * This status' ID.
   * @since v1.0.0
   */
  readonly id: string;

  /**
   * This status' name.
   * @since v1.0.0
   */
  readonly name: string;

  /**
   * This status' description.
   * @since v1.0.0
   */
  readonly description?: string;

  /**
   * This status' default color.
   * @since v1.0.0
   */
  readonly color?: string;

  constructor(props: StatusProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.color = props.color;
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