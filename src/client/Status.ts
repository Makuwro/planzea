import Client, { Optional, PropertiesUpdate } from "./Client";

export interface StatusProperties {
  id: string;
  color: number;
  description?: string;
  name: string;
  nextStatusId?: string;
}

export type InitialStatusProperties = Optional<Omit<StatusProperties, "id">, "color">;

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
  readonly color: StatusProperties["color"];

  /**
   * This status' description.
   * @since v1.1.0
   */
  readonly description: StatusProperties["description"];

  /**
   * This status' ID.
   * @since v1.1.0
   */
  readonly id: StatusProperties["id"];

  /**
   * This status' name.
   * @since v1.1.0
   */
  readonly name: StatusProperties["name"];

  /**
   * @since v1.1.0
   */
  readonly nextStatusId?: StatusProperties["nextStatusId"];

  constructor(props: StatusProperties, client: Client) {

    this.color = props.color;
    this.id = props.id;
    this.name = props.name;
    this.nextStatusId = props.nextStatusId;
    this.description = props.description;
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