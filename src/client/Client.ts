import ObjectID from "bson-objectid";
import Attachment, { AttachmentProperties, InitialAttachmentProperties } from "./Attachment";
import { ClientDatabase } from "./ClientDatabase";
import Task, { InitialTaskProperties, TaskProperties } from "./Task";
import Label, { InitialLabelProperties, LabelProperties } from "./Label";
import Project, { InitialProjectProperties, ProjectProperties } from "./Project";
import "dexie-export-import";
import TaskList, { InitialTaskListProperties, TaskListProperties } from "./TaskList";
import { ContentNotFoundError } from "./errors/ContentNotFoundError";
import Status, { InitialStatusProperties, StatusProperties } from "./Status";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;
export type PlanzeaObject = Attachment | Label | Status | Task | TaskList | Project;
export type PlanzeaObjectConstructor = typeof Attachment | typeof Label | typeof Status | typeof TaskList | typeof Task | typeof Project;
export type PlanzeaObjectProperties = AttachmentProperties & TaskProperties & LabelProperties & ProjectProperties & StatusProperties;

export type ContentCreateEventCallback<ContentType> = ((content: ContentType) => void) | (() => void);
export type ContentDeleteEventCallback = ((contentId: string) => void) | (() => void);
export type ContentUpdateEventCallback<ContentType, ContentProperties> = ((newContent: ContentType, oldContentProperties?: ContentProperties) => void) | ((newContent: ContentType) => void) | (() => void);

export interface EventCallbacks {
  labelCreate: ContentCreateEventCallback<Label>;
  labelDelete: ContentDeleteEventCallback;
  labelUpdate: ContentUpdateEventCallback<Label, LabelProperties>;
  projectCreate: ContentCreateEventCallback<Project>;
  projectDelete: ContentDeleteEventCallback;
  projectUpdate: ContentUpdateEventCallback<Project, ProjectProperties>;
  statusCreate: ContentCreateEventCallback<Status>;
  statusDelete: ContentDeleteEventCallback;
  statusUpdate: ContentUpdateEventCallback<Status, StatusProperties>;
  taskCreate: ContentCreateEventCallback<Task>;
  taskDelete: ContentDeleteEventCallback;
  taskUpdate: ContentUpdateEventCallback<Task, TaskProperties>;
  taskListCreate: ContentCreateEventCallback<TaskList>;
  taskListDelete: ContentDeleteEventCallback;
  taskListUpdate: ContentUpdateEventCallback<TaskList, TaskListProperties>;
}

type EventCallbacksArray = {
  [EventName in keyof EventCallbacks]: EventCallbacks[EventName][];
};

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
  protected eventCallbacks: EventCallbacksArray = {
    labelCreate: [],
    labelDelete: [],
    labelUpdate: [],
    projectCreate: [],
    projectDelete: [],
    projectUpdate: [],
    statusCreate: [],
    statusDelete: [],
    statusUpdate: [],
    taskCreate: [],
    taskDelete: [],
    taskUpdate: [],
    taskListCreate: [],
    taskListDelete: [],
    taskListUpdate: []
  };
  personalProjectId?: string;

  async #createObject(constructor: typeof Attachment, props: InitialAttachmentProperties): Promise<Attachment>;
  async #createObject(constructor: typeof Label, props: InitialLabelProperties): Promise<Label>;
  async #createObject(constructor: typeof Status, props: InitialStatusProperties): Promise<Status>;
  async #createObject(constructor: typeof Task, props: InitialTaskProperties): Promise<Task>;
  async #createObject(constructor: typeof TaskList, props: InitialTaskListProperties): Promise<TaskList>;
  async #createObject(constructor: typeof Project, props: InitialProjectProperties): Promise<Project>;
  async #createObject(constructor: PlanzeaObjectConstructor, props: InitialAttachmentProperties | InitialLabelProperties | InitialStatusProperties | InitialTaskProperties | InitialTaskListProperties | InitialProjectProperties): Promise<PlanzeaObject> {

    const { tableName } = constructor;
    const content = new constructor({
      ...props,
      id: await this.#getUnusedId(tableName),
    } as PlanzeaObjectProperties, this);

    await clientDatabase[tableName].add(content as unknown as PlanzeaObjectProperties);
    return content;

  }

  async #getObject(constructor: typeof Attachment, objectId: string): Promise<Attachment>;
  async #getObject(constructor: typeof Label, objectId: string): Promise<Label>;
  async #getObject(constructor: typeof Status, objectId: string): Promise<Status>;
  async #getObject(constructor: typeof Task, objectId: string): Promise<Task>;
  async #getObject(constructor: typeof TaskList, objectId: string): Promise<TaskList>;
  async #getObject(constructor: typeof Project, objectId: string): Promise<Project>;
  async #getObject(constructor: PlanzeaObjectConstructor, objectId: string): Promise<PlanzeaObject> {

    const properties = await this.#db[constructor.tableName].get(objectId);

    if (!properties) {

      throw new ContentNotFoundError(objectId);

    }

    return new (constructor)(properties as PlanzeaObjectProperties, this);

  }

  async #getObjects(constructor: typeof Attachment): Promise<Attachment[]>;
  async #getObjects(constructor: typeof Label): Promise<Label[]>;
  async #getObjects(constructor: typeof Status): Promise<Status[]>;
  async #getObjects(constructor: typeof Task): Promise<Task[]>;
  async #getObjects(constructor: typeof TaskList): Promise<TaskList[]>;
  async #getObjects(constructor: typeof Project): Promise<Project[]>;
  async #getObjects(constructor: PlanzeaObjectConstructor): Promise<PlanzeaObject[]> {

    const objects = [];
    const issuePropertiesArray = await this.#db[constructor.tableName].toArray() as PlanzeaObjectProperties[];

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
  async #getUnusedId(tableName: PlanzeaObjectConstructor["tableName"]): Promise<string> {

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

  async createLabel(props: InitialLabelProperties): Promise<Label> {

    // Create the label.
    const label = await this.#createObject(Label, {...props, color: props.color ?? 0});

    // Fire the event.
    this.#fireEvent("labelCreate", label);

    // Return the label.
    return label;

  }

  /**
   * Adds a status to the database.
   * @param props Status properties.
   * @since v1.1.0
   * @returns A `Status` object.
   */
  async createStatus(props: InitialStatusProperties): Promise<Status> {

    const status = await this.#createObject(Status, {...props, color: props.color ?? 15527148});

    // Fire the event.
    this.#fireEvent("statusCreate", status);

    return status;

  }

  /**
   * Adds a task to the database.
   * @param props Task properties.
   * @since v1.0.0
   * @returns A `Task` object.
   */
  async createTask(props: InitialTaskProperties): Promise<Task> {

    const task = await this.#createObject(Task, props);

    // Fire the event.
    this.#fireEvent("taskCreate", task);

    return task;
    
  }

  async createTaskList(props: InitialTaskListProperties = {}) {

    // Set the defaults.
    props.name = props.name ?? "Tasks";
    props.taskIds = props.taskIds ?? [];

    // Create the task list.
    const taskList = await this.#createObject(TaskList, props);

    // Fire the event.
    this.#fireEvent("taskListCreate", taskList);

    return taskList;

  }

  async createProject(props: InitialProjectProperties): Promise<Project> {

    let statusCompleted, statusInProgress, statusNotStarted;
    if (!props.statusIds) {

      statusCompleted = await this.createStatus({
        name: "Completed",
        color: 3055966
      });
  
      statusInProgress = await this.createStatus({
        name: "In Progress",
        color: 5412849,
        nextStatusId: statusCompleted.id
      });
  
      statusNotStarted = await this.createStatus({
        name: "Not Started",
        color: 15527148,
        nextStatusId: statusInProgress.id
      });

      await statusCompleted.update({nextStatusId: statusNotStarted.id});

      props.statusIds = [statusNotStarted.id, statusInProgress.id, statusCompleted.id];

    }

    const project = await this.#createObject(Project, {...props, labelIds: props.labelIds ?? []});

    // Fire the event.
    this.#fireEvent("projectCreate", project);

    return project;

  }

  async deleteAttachment(attachmentId: string): Promise<void> {

    await this.#db.attachments.delete(attachmentId);

  }

  async deleteLabel(labelId: string): Promise<void> {

    await this.#db.labels.delete(labelId);

    // Run each callback.
    this.#fireEvent("labelDelete", labelId);

  }

  async deleteStatus(statusId: string): Promise<void> {

    for (const project of (await this.getProjects()).filter((possibleProject) => possibleProject.statusIds.includes(statusId))) {

      // Change all project tasks to the default status.
      const newProjectStatusIds = project.statusIds.filter((possibleStatusId) => possibleStatusId !== statusId);
      for (const task of (await this.getTasks()).filter((possibleTask) => possibleTask.statusId === statusId && possibleTask.projectId === project.id)) {

        console.log(`Changing ${task.id} to the default status (${project.statusIds[0]})...`);
        await task.update({statusId: newProjectStatusIds[0]});

      }
      
      // Remove the status from the project.
      console.log(`Removing status ${statusId} from project ${project.id}...`);
      await project.update({statusIds: newProjectStatusIds});

    }

    // Delete the status from the database.
    console.log(`Deleting status ${statusId}...`);
    await this.#db.statuses.delete(statusId);

    // Run each callback.
    this.#fireEvent("statusDelete", statusId);

  }

  /**
   * Deletes a task from the database.
   * @param taskId The task's ID.
   */
  async deleteTask(taskId: string): Promise<void> {

    // Delete all attachments.
    for (const attachment of (await this.getAttachments()).filter((possibleTaskAttachment) => possibleTaskAttachment.taskIds.includes(taskId))) {

      attachment.taskIds = attachment.taskIds.filter((possibleTaskId) => possibleTaskId === taskId);
      if (attachment.taskIds[0]) {

        await attachment.update(attachment);

      } else {

        await attachment.delete();

      }

    }

    // Delete the task.
    await this.#db.tasks.delete(taskId);

    // Run each callback.
    this.#fireEvent("taskDelete", taskId);

  }

  async deleteTaskList(taskListId: string): Promise<void> {

    // Delete this list.
    await this.#db.taskLists.delete(taskListId);

    // Update each task.
    const taskListFilter = (possibleTaskList: TaskListProperties) => possibleTaskList.id === taskListId;
    for (const task of (await this.getTasks()).filter((possibleTask) => possibleTask.taskLists?.find(taskListFilter))) {

      await task.update({taskLists: task.taskLists?.filter(taskListFilter)});

    }

    // Fire event.
    this.#fireEvent("taskListDelete", taskListId);

  }

  async deleteProject(projectId: string): Promise<void> {

    // Delete each project task.
    for (const task of (await this.getTasks()).filter((possibleProjectTask) => possibleProjectTask.projectId === projectId)) {

      await task.delete();

    }

    // Delete the project.
    await this.#db.projects.delete(projectId);

    // Fire the event.
    this.#fireEvent("projectDelete", projectId);

  }

  async export(): Promise<Blob> {

    return await this.#db.export();

  }

  #fireEvent<EventName extends keyof EventCallbacksArray>(eventName: EventName, ...props: Parameters<EventCallbacks[EventName]>): void {

    for (const callback of this.eventCallbacks[eventName]) {

      (callback as (...props: Parameters<EventCallbacks[EventName]>) => void)(...props);

    }

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
      await this.#db.settings.put(personalProject.id, "personalProjectId");
      this.personalProjectId = personalProject.id;

    }

    // Fix tasks.
    console.log("Checking for tasks with outdated properties...");
    for (const taskProperties of (await this.#db.tasks.toArray()).filter((possibleTask) => possibleTask.parentTaskId)) {

      if (taskProperties.parentTaskId) {

        // Get the parent task.
        const parentTask = await this.getTask(taskProperties.parentTaskId);

        // Create the default task list, if necessary.
        const taskLists = parentTask.taskLists ?? [];
        const taskListId = taskLists.find((list) => list.name === "Tasks")?.id;
        let taskList = taskListId ? await this.getTaskList(taskListId) : undefined;
        if (!taskList) {
          
          taskList = await this.createTaskList({name: "Tasks"});

        }

        // Add this task to the list.
        await taskList.update({taskIds: [...taskList.taskIds, taskProperties.id]});

        // Remove the parentTaskId.
        await this.updateTask(taskProperties.id, {parentTaskId: undefined});

      }

    }

    // Fix projects.
    console.log("Checking for projects with outdated properties...");
    for (const projectProperties of (await this.#db.projects.toArray()).filter((possibleProject) => possibleProject.defaultStatusId || possibleProject.statuses)) {

      if (projectProperties.statuses) {

        const statusIds = [];
        for (const statusInfo of projectProperties.statuses) {

          const newStatusId = (await this.createStatus(statusInfo)).id;
          statusIds.push(newStatusId);

          for (const taskProperties of (await this.#db.tasks.toArray()).filter((possibleTask) => possibleTask.statusId === statusInfo.id)) {

            await this.updateTask(taskProperties.id, {statusId: newStatusId});

          }

        }

        await this.updateProject(projectProperties.id, {statusIds, defaultStatusId: undefined, statuses: undefined});

      }

    }

    // Fix labels.
    console.log("Checking for labels with outdated properties...");
    for (const labelProperties of (await this.#db.labels.toArray()).filter((possibleLabel) => possibleLabel.projects || possibleLabel.color === undefined || Number.isNaN(possibleLabel.color))) {

      if (labelProperties.projects) {

        for (const projectId of labelProperties.projects) {

          // Update all projects.
          console.log(`Updating project (${labelProperties.id}) to include label (${labelProperties.id})...`);
          const project = await this.getProject(projectId);
          await project.update({labelIds: [...(project.labelIds ?? []), labelProperties.id]});

          // Remove the projects array from the label.
          console.log(`Removing label (${labelProperties.id}) projects array...`);
          await this.updateLabel(labelProperties.id, {projects: undefined});

        }

      }

      if (labelProperties.color === undefined || Number.isNaN(labelProperties.color)) {

        console.log(`Updating label (${labelProperties.id}) to have a decimal color...`);
        await this.updateLabel(labelProperties.id, {color: Number(labelProperties.color ?? 0)});

      }

    }

    console.log("All content properties are updated!");
    
  }

  async getAttachment(attachmentId: string): Promise<Attachment> {

    return await this.#getObject(Attachment, attachmentId);

  }

  async getAttachments(): Promise<Attachment[]> {

    return await this.#getObjects(Attachment);

  }

  async getTask(taskId: string): Promise<Task> {

    return await this.#getObject(Task, taskId);

  }

  async getTaskList(taskListId: string): Promise<TaskList> {

    return await this.#getObject(TaskList, taskListId);

  }

  async getTaskLists(): Promise<TaskList[]> {

    return await this.#getObjects(TaskList);

  }

  /**
   * Gets all client tasks.
   * @returns An array of `Task` objects.
   */
  async getTasks(): Promise<Task[]> {

    return await this.#getObjects(Task);

  }

  async getLabel(labelId: string): Promise<Label> {

    return await this.#getObject(Label, labelId);

  }

  /**
   * Gets all client labels.
   * @returns An array of `Label` objects.
   */
  async getLabels(): Promise<Label[]> {

    return await this.#getObjects(Label);

  }

  async getStatus(statusId: string): Promise<Status> {

    return await this.#getObject(Status, statusId);

  }

  async getStatuses(): Promise<Status[]> {

    return await this.#getObjects(Status);

  }

  async getProject(projectId: string): Promise<Project> {

    return await this.#getObject(Project, projectId);

  }

  async getProjects(): Promise<Project[]> {

    return await this.#getObjects(Project);

  }

  addEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: EventCallbacks[EventName]): void {

    this.eventCallbacks[eventName].push(callback as () => void);

  } 

  removeEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: EventCallbacks[EventName]): void {

    this.eventCallbacks[eventName] = (this.eventCallbacks[eventName] as (() => void)[]).filter((possibleCallback) => possibleCallback !== callback);

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
    this.#fireEvent("taskUpdate", task, oldTaskProperties);

  }

  async updateStatus(statusId: string, newProperties: PropertiesUpdate<StatusProperties>): Promise<void> {

    // Get current project properties.
    const oldStatusProperties = await this.#db.statuses.get(statusId);

    // Update the project.
    await this.#db.statuses.update(statusId, newProperties);

    // Fire the event.
    this.#fireEvent("statusUpdate", await this.getStatus(statusId), oldStatusProperties);

  }

  async updateTaskList(taskListId: string, newProperties: PropertiesUpdate<TaskListProperties>): Promise<void> {

    // Get current task properties.
    const oldTasklistProperties = await this.#db.taskLists.get(taskListId);

    // Update the task.
    await this.#db.taskLists.update(taskListId, newProperties);

    // Fire the event.
    const taskList = await this.getTaskList(taskListId);
    this.#fireEvent("taskListUpdate", taskList, oldTasklistProperties);

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    // Get current label properties.
    const oldLabelProperties = await this.#db.labels.get(labelId);

    // Update the label.
    await this.#db.labels.update(labelId, newProperties);

    // Fire the event.
    const label = await this.getLabel(labelId);
    this.#fireEvent("labelUpdate", label, oldLabelProperties);

  }

  async updateProject(projectId: string, newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    // Get current project properties.
    const oldProjectProperties = await this.#db.projects.get(projectId);

    // Update the project.
    await this.#db.projects.update(projectId, newProperties);

    // Fire the event.
    this.#fireEvent("projectUpdate", await this.getProject(projectId), oldProjectProperties);

  }

}