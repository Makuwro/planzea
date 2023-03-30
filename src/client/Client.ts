import ObjectID from "bson-objectid";
import Attachment, { AttachmentProperties, InitialAttachmentProperties } from "./Attachment";
import { ClientDatabase } from "./ClientDatabase";
import Issue, { InitialIssueProperties, IssueProperties } from "./Issue";
import Label, { InitialLabelProperties, LabelProperties } from "./Label";
import Project, { defaultStatuses, InitialProjectProperties, ProjectProperties } from "./Project";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;
export type PlanzeaObject = Attachment | Issue | Label | Project;
export type PlanzeaObjectConstructor = typeof Attachment | typeof Issue | typeof Label | typeof Project;
export type PlanzeaObjectProperties = AttachmentProperties & IssueProperties & LabelProperties & ProjectProperties;

export async function convertBlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();
    reader.addEventListener("loadend", () => {

      if (reader.result instanceof ArrayBuffer) {

        resolve(reader.result);

      }

      reject(reader.result);

    });
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(blob);

  });

}

const clientDatabase = new ClientDatabase();

export default class Client {

  readonly #db = clientDatabase;

  async #createObject(constructor: typeof Attachment, props: InitialAttachmentProperties): Promise<Attachment>;
  async #createObject(constructor: typeof Issue, props: InitialIssueProperties): Promise<Issue>;
  async #createObject(constructor: typeof Label, props: InitialLabelProperties): Promise<Label>;
  async #createObject(constructor: typeof Project, props: InitialProjectProperties): Promise<Project>;
  async #createObject(constructor: PlanzeaObjectConstructor, props: InitialAttachmentProperties | InitialIssueProperties | InitialLabelProperties | InitialProjectProperties): Promise<PlanzeaObject> {

    const { tableName } = constructor;
    const isProject = constructor === Project;
    const content = new constructor({
      ...props,
      id: await this.#getUnusedId(tableName), 
      statuses: isProject ? defaultStatuses : undefined,
      defaultStatusId: isProject ? "dns" : undefined
    } as PlanzeaObjectProperties, this);

    await clientDatabase[tableName].add(content as unknown as PlanzeaObjectProperties);
    return content;

  }

  async #getObject(constructor: typeof Attachment, objectId: string): Promise<Attachment>;
  async #getObject(constructor: typeof Issue, objectId: string): Promise<Issue>;
  async #getObject(constructor: typeof Label, objectId: string): Promise<Label>;
  async #getObject(constructor: typeof Project, objectId: string): Promise<Project>;
  async #getObject(constructor: PlanzeaObjectConstructor, objectId: string): Promise<PlanzeaObject> {

    const properties = await this.#db[constructor.tableName].get(objectId);

    if (!properties) {

      throw new Error();

    }

    return new (constructor)(properties as PlanzeaObjectProperties, this);

  }

  async #getObjects(constructor: typeof Attachment, filter?: Partial<AttachmentProperties>, exclusiveKeys?: [(keyof AttachmentProperties)?]): Promise<Attachment[]>;
  async #getObjects(constructor: typeof Issue, filter?: Partial<IssueProperties>, exclusiveKeys?: [(keyof IssueProperties)?]): Promise<Issue[]>;
  async #getObjects(constructor: typeof Label, filter?: Partial<LabelProperties>, exclusiveKeys?: [(keyof LabelProperties)?]): Promise<Label[]>;
  async #getObjects(constructor: typeof Project, filter?: Partial<ProjectProperties>, exclusiveKeys?: [(keyof ProjectProperties)?]): Promise<Project[]>;
  async #getObjects(constructor: PlanzeaObjectConstructor, filter: Partial<PlanzeaObjectProperties> = {}, exclusiveKeys: [(keyof PlanzeaObjectProperties)?] = []): Promise<PlanzeaObject[]> {

    const objects = [];
    const issuePropertiesArray = (await this.#db[constructor.tableName].toArray() as PlanzeaObjectProperties[]).filter((object) => {

      for (const key of Object.keys(filter) as (keyof IssueProperties)[]) {

        const issueValue = object[key];
        const filterValue = filter[key];
        if (issueValue instanceof Array && filterValue instanceof Array) {

          for (const item of filterValue) {

            const includesKey = issueValue.includes(item);
            if (exclusiveKeys.includes(key) ? includesKey : !includesKey) {

              return false;

            }

          }

        } else if (exclusiveKeys.includes(key) ? issueValue === filterValue : issueValue !== filterValue) {

          return false;

        }

      }

      return true;

    });


    for (const properties of issuePropertiesArray) {

      objects.push(new (constructor)(properties, this));

    }

    return objects;

  }

  /**
   * Finds an unused ID string for a specific table.
   * @param tableName The name of the table.
   * @returns An unused ID string.
   */
  async #getUnusedId(tableName: "attachments" | "issues" | "labels" | "projects"): Promise<string> {

    let id = null;
    do {
      
      id = new ObjectID().toHexString();
      if (await clientDatabase[tableName].get(id)) {

        id = null;

      }
      
    } while (!id);

    return id;

  }

  async createAttachment(props: InitialAttachmentProperties): Promise<Attachment> {

    return await this.#createObject(Attachment, props);

  }

  /**
   * Adds an issue to the database.
   * @param props Issue properties.
   * @returns An `Issue` object.
   */
  async createIssue(props: InitialIssueProperties): Promise<Issue> {

    return await this.#createObject(Issue, props);
    
  }

  async createLabel(props: InitialLabelProperties): Promise<Label> {

    return await this.#createObject(Label, props);

  }

  async createProject(props: InitialProjectProperties): Promise<Project> {

    return await this.#createObject(Project, props);

  }

  async deleteAttachment(attachmentId: string): Promise<void> {

    await this.#db.attachments.delete(attachmentId);

  }

  /**
   * Deletes an issue from the database.
   * @param issueId The issue's ID.
   */
  async deleteIssue(issueId: string): Promise<void> {

    // Delete all tasks.
    await this.#db.issues.bulkDelete((await this.#db.issues.toArray()).reduce((ids, possibleIssue) => {
      
      if (possibleIssue.parentIssueId === issueId) {

        ids.push(possibleIssue.id);

      }

      return ids;
      
    }, [] as string[]));

    // Get all associated attachments.
    for (const attachment of await this.getAttachments()) {

      attachment.issueIds = attachment.issueIds.filter((possibleIssueId) => possibleIssueId === issueId);
      if (attachment.issueIds[0]) {

        await attachment.update(attachment);

      } else {

        console.log("Deleting attachment...");
        await attachment.delete();

      }

    }

    // Delete the issue.
    await this.#db.issues.delete(issueId);

  }

  async deleteLabel(labelId: string): Promise<void> {

    await this.#db.labels.delete(labelId);

  }

  async deleteProject(projectId: string): Promise<void> {

    await this.#db.projects.delete(projectId);

  }

  async getAttachment(attachmentId: string): Promise<Attachment> {

    return await this.#getObject(Attachment, attachmentId);

  }

  async getAttachments(filter: Partial<AttachmentProperties> = {}, exclusiveKeys: [(keyof AttachmentProperties)?] = []): Promise<Attachment[]> {

    return await this.#getObjects(Attachment, filter, exclusiveKeys);

  }

  async getIssue(issueId: string): Promise<Issue> {

    return await this.#getObject(Issue, issueId);

  }

  /**
   * Gets all client issues.
   * @returns An array of `Issue` objects.
   */
  async getIssues(filter: Partial<IssueProperties> = {}, exclusiveKeys: [(keyof IssueProperties)?] = []): Promise<Issue[]> {

    return await this.#getObjects(Issue, filter, exclusiveKeys);

  }

  /**
   * Gets all client labels.
   * @returns An array of `Label` objects.
   */
  async getLabels(filter: Partial<LabelProperties> = {}, exclusiveKeys: [(keyof LabelProperties)?] = []): Promise<Label[]> {

    return await this.#getObjects(Label, filter, exclusiveKeys);

  }

  async getProject(projectId: string): Promise<Project> {

    return await this.#getObject(Project, projectId);

  }

  async getProjects(filter: Partial<ProjectProperties> = {}, exclusiveKeys: [(keyof ProjectProperties)?] = []): Promise<Project[]> {

    return await this.#getObjects(Project, filter, exclusiveKeys);

  }

  async updateAttachment(attachmentId: string, newProperties: PropertiesUpdate<AttachmentProperties>): Promise<void> {

    await this.#db.attachments.update(attachmentId, newProperties);

  }

  async updateIssue(labelId: string, newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.#db.issues.update(labelId, newProperties);

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.#db.labels.update(labelId, newProperties);

  }

  async updateProject(projectId: string, newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#db.projects.update(projectId, newProperties);

  }

}