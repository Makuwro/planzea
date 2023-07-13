export interface HistoryEntryProperties {
  id: string;
  actionType: string;
}

export default abstract class HistoryEntry {

  /**
   * This class' table name.
   * @since v1.0.0
   */
  static readonly tableName = "history" as const;

  /**
   * This history entry's ID. The timestamp can be retrieved using this ID because this is an `ObjectId`.
   * @since v1.0.0
   */
  readonly id: HistoryEntryProperties["id"];

  /**
   * This history entry's action type.
   * @since v1.0.0
   */
  readonly action: HistoryEntryProperties["actionType"];

  constructor(props: HistoryEntryProperties) {

    this.id = props.id;
    this.action = props.actionType;

  }

}