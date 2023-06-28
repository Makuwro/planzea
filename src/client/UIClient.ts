import Task from "./Task";

interface EventCallbacks {
  taskBacklogSelectionChange: ((tasks: Task[]) => void) | (() => void);
}

type EventCallbacksArray = {
  [EventName in keyof EventCallbacks]: EventCallbacks[EventName][];
};

type MutableUIClient = {
  -readonly [K in keyof UIClient]: UIClient[K];
};

export default class UIClient {

  #eventCallbacks: EventCallbacksArray = {
    taskBacklogSelectionChange: []
  };
  readonly selectedTasks: Task[] = [];

  addEventListener<EventName extends "taskBacklogSelectionChange">(eventName: EventName, callback: EventCallbacks[EventName]): void;
  addEventListener(eventName: keyof EventCallbacks, callback: EventCallbacks[keyof EventCallbacks]): void {

    this.#eventCallbacks[eventName].push(callback as () => void);

  }

  removeEventListener<EventName extends "taskBacklogSelectionChange">(eventName: EventName, callback: EventCallbacks[EventName]): void;
  removeEventListener(eventName: keyof EventCallbacks, callback: EventCallbacks[keyof EventCallbacks]): void {

    this.#eventCallbacks[eventName] = (this.#eventCallbacks[eventName] as (() => void)[]).filter((possibleCallback) => possibleCallback !== callback);

  }

  setSelectedTasks(tasks: Task[]): void {

    (this as MutableUIClient).selectedTasks = tasks;

    for (const callback of this.#eventCallbacks.taskBacklogSelectionChange) {

      callback(tasks);

    }

  }

}