import ObjectID from "bson-objectid";
import Attachment, { AttachmentProperties, InitialAttachmentProperties } from "./Attachment";
import { ClientDatabase } from "./ClientDatabase";
import Task, { InitialTaskProperties, TaskProperties } from "./Task";
import Label, { InitialLabelProperties, LabelProperties } from "./Label";
import Project, { defaultStatuses, InitialProjectProperties, ProjectProperties } from "./Project";
import "dexie-export-import";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;
export type PlanzeaObject = Attachment | Task | Label | Project;
export type PlanzeaObjectConstructor = typeof Attachment | typeof Task | typeof Label | typeof Project;
export type PlanzeaObjectProperties = AttachmentProperties & TaskProperties & LabelProperties & ProjectProperties;

interface EventCallbacks {
  labelCreate: ((label: Label) => void) | (() => void);
  labelDelete: ((labelId: string) => void) | (() => void);
  labelUpdate: ((newLabel: Label, oldLabelProperties?: LabelProperties) => void) | ((newLabel: Label) => void) | (() => void);
  taskCreate: ((task: Task) => void) | (() => void);
  taskUpdate: ((newTask: Task, oldTaskProperties?: TaskProperties) => void) | ((newTask: Task) => void) | (() => void);
}

interface EventCallbacksArray {
  labelCreate: EventCallbacks["labelCreate"][];
  labelDelete: EventCallbacks["labelDelete"][];
  labelUpdate: EventCallbacks["labelUpdate"][];
  taskCreate: EventCallbacks["taskCreate"][];
  taskUpdate: EventCallbacks["taskUpdate"][];
}

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
  eventCallbacks: EventCallbacksArray = {
    labelCreate: [],
    labelDelete: [],
    labelUpdate: [],
    taskCreate: [],
    taskUpdate: []
  };
  personalProjectId?: string;

  async #createObject(constructor: typeof Attachment, props: InitialAttachmentProperties): Promise<Attachment>;
  async #createObject(constructor: typeof Task, props: InitialTaskProperties): Promise<Task>;
  async #createObject(constructor: typeof Label, props: InitialLabelProperties): Promise<Label>;
  async #createObject(constructor: typeof Project, props: InitialProjectProperties): Promise<Project>;
  async #createObject(constructor: PlanzeaObjectConstructor, props: InitialAttachmentProperties | InitialTaskProperties | InitialLabelProperties | InitialProjectProperties): Promise<PlanzeaObject> {

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
  async #getObject(constructor: typeof Task, objectId: string): Promise<Task>;
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
  async #getObjects(constructor: typeof Task, filter?: Partial<TaskProperties>, exclusiveKeys?: [(keyof TaskProperties)?]): Promise<Task[]>;
  async #getObjects(constructor: typeof Label, filter?: Partial<LabelProperties>, exclusiveKeys?: [(keyof LabelProperties)?]): Promise<Label[]>;
  async #getObjects(constructor: typeof Project, filter?: Partial<ProjectProperties>, exclusiveKeys?: [(keyof ProjectProperties)?]): Promise<Project[]>;
  async #getObjects(constructor: PlanzeaObjectConstructor, filter: Partial<PlanzeaObjectProperties> = {}, exclusiveKeys: [(keyof PlanzeaObjectProperties)?] = []): Promise<PlanzeaObject[]> {

    const objects = [];
    const issuePropertiesArray = (await this.#db[constructor.tableName].toArray() as PlanzeaObjectProperties[]).filter((object) => {

      for (const key of Object.keys(filter) as (keyof TaskProperties)[]) {

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
  async #getUnusedId(tableName: "attachments" | "tasks" | "labels" | "projects"): Promise<string> {

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
  async createTask(props: InitialTaskProperties): Promise<Task> {

    return await this.#createObject(Task, props);
    
  }

  async createLabel(props: InitialLabelProperties): Promise<Label> {

    // Create the label.
    const label = await this.#createObject(Label, props);

    // Run each callback.
    for (const callback of this.eventCallbacks.labelCreate) {

      callback(label);

    }

    // Return the label.
    return label;

  }

  async createProject(props: InitialProjectProperties): Promise<Project> {

    return await this.#createObject(Project, props);

  }

  async deleteAttachment(attachmentId: string): Promise<void> {

    await this.#db.attachments.delete(attachmentId);

  }

  /**
   * Deletes a task from the database.
   * @param taskId The task's ID.
   */
  async deleteTask(taskId: string, shouldDeleteSubtasks?: boolean): Promise<void> {

    // Delete all tasks.
    await this.#db.tasks.bulkDelete((await this.#db.tasks.toArray()).reduce((ids, possibleTask) => {
      
      if (possibleTask.parentTaskId === taskId) {

        ids.push(possibleTask.id);

      }

      return ids;
      
    }, [] as string[]));

    // Delete all associated attachments.
    for (const attachment of await this.getAttachments()) {

      attachment.taskIds = attachment.taskIds.filter((possibleTaskId) => possibleTaskId === taskId);
      if (attachment.taskIds[0]) {

        await attachment.update(attachment);

      } else {

        await attachment.delete();

      }

    }

    // Delete or promote sub-tasks.
    const subtasks = (await this.getTasks()).filter((possibleTask) => possibleTask.parentTaskId === taskId);
    for (const task of subtasks) {

      if (shouldDeleteSubtasks) {

        await task.delete(true);

      } else {

        await task.update({parentTaskId: undefined});

      }

    }

    // Delete the task.
    await this.#db.tasks.delete(taskId);

  }

  async deleteLabel(labelId: string): Promise<void> {

    await this.#db.labels.delete(labelId);

    // Run each callback.
    for (const callback of this.eventCallbacks.labelDelete) {

      callback(labelId);

    }

  }

  async deleteProject(projectId: string): Promise<void> {

    await this.#db.projects.delete(projectId);

  }

  async export(): Promise<Blob> {

    return await this.#db.export();

  }

  async import(blob: Blob): Promise<void> {

    const backup = await this.#db.export();
    try {

      this.#db.delete();
      this.#db.open();
      await this.#db.import(blob);
      
    } catch (err) {

      alert(err);
      this.#db.import(backup);

    }

  }

  async initialize(): Promise<void> {

    // Make sure the user has a personal project.
    const personalProjectId = this.personalProjectId ?? await this.#db.settings.get("personalProjectId");

    if (!personalProjectId) {

      // Create a personal project.
      const personalProject = await this.createProject({name: "Personal"});
      this.#db.settings.put(personalProject.id, "personalProjectId");
      this.personalProjectId = personalProject.id;

    }
    
  }

  async getAttachment(attachmentId: string): Promise<Attachment> {

    return await this.#getObject(Attachment, attachmentId);

  }

  async getAttachments(filter: Partial<AttachmentProperties> = {}, exclusiveKeys: [(keyof AttachmentProperties)?] = []): Promise<Attachment[]> {

    return await this.#getObjects(Attachment, filter, exclusiveKeys);

  }

  async getTask(taskId: string): Promise<Task> {

    return await this.#getObject(Task, taskId);

  }

  /**
   * Gets all client tasks.
   * @returns An array of `Task` objects.
   */
  async getTasks(filter: Partial<TaskProperties> = {}, exclusiveKeys: [(keyof TaskProperties)?] = []): Promise<Task[]> {

    return await this.#getObjects(Task, filter, exclusiveKeys);

  }

  async getLabel(labelId: string): Promise<Label> {

    return await this.#getObject(Label, labelId);

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

  addEventListener(eventName: "labelCreate", callback: EventCallbacks["labelCreate"]): void;
  addEventListener(eventName: "labelDelete", callback: EventCallbacks["labelDelete"]): void;
  addEventListener(eventName: "labelUpdate", callback: EventCallbacks["labelUpdate"]): void;
  addEventListener(eventName: "taskUpdate", callback: EventCallbacks["taskUpdate"]): void;
  addEventListener(eventName: keyof EventCallbacks, callback: EventCallbacks[keyof EventCallbacks]): void {

    this.eventCallbacks[eventName].push(callback as () => void);

  } 

  removeEventListener(eventName: "labelCreate", callback: EventCallbacks["labelCreate"]): void;
  removeEventListener(eventName: "labelDelete", callback: EventCallbacks["labelDelete"]): void;
  removeEventListener(eventName: "labelUpdate", callback: EventCallbacks["labelUpdate"]): void;
  removeEventListener(eventName: "taskUpdate", callback: EventCallbacks["taskUpdate"]): void;
  removeEventListener(eventName: keyof EventCallbacks, callback: EventCallbacks[keyof EventCallbacks]): void {

    this.eventCallbacks[eventName] = (this.eventCallbacks[eventName] as (() => void)[]).filter((possibleCallback) => possibleCallback !== callback);

  }

  async removeLabelFromProject(labelId: string, projectId: string): Promise<void> {

    const label = await this.getLabel(labelId);

    if (label.projects) {

      // Remove the label from the project.
      await label.update({
        projects: label.projects.filter((possibleProjectId) => possibleProjectId !== projectId)
      });

      // Run each callback.
      for (const callback of this.eventCallbacks.labelDelete) {

        callback(labelId);

      }

    }
    
  }

  async updateAttachment(attachmentId: string, newProperties: PropertiesUpdate<AttachmentProperties>): Promise<void> {

    await this.#db.attachments.update(attachmentId, newProperties);

  }

  async updateTask(taskId: string, newProperties: PropertiesUpdate<TaskProperties>): Promise<void> {

    // Get current task properties.
    const oldTaskProperties = await this.#db.tasks.get(taskId);

    // Update the task.
    await this.#db.tasks.update(taskId, newProperties);

    // Fire the event.
    const task = await this.getTask(taskId);
    for (const callback of this.eventCallbacks.taskUpdate) {

      callback(task, oldTaskProperties);

    }

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    // Get current label properties.
    const oldLabelProperties = await this.#db.labels.get(labelId);

    // Update the label.
    await this.#db.labels.update(labelId, newProperties);

    // Fire the event.
    const label = await this.getLabel(labelId);
    for (const callback of this.eventCallbacks.labelUpdate) {

      callback(label, oldLabelProperties);

    }

  }

  async updateProject(projectId: string, newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#db.projects.update(projectId, newProperties);

  }

}