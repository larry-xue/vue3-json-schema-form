import { AxiosPromise, AxiosResponse } from 'axios';

interface ModelAttributes<T> {
  get<K extends keyof T>(key: K): T[K];
  set(update: T): void;
  getAll(): T;
}

interface Sync<T> {
  fetch(id: number): AxiosPromise;
  save(data: T): AxiosPromise;
}

interface Eventing {
  on(eventName: string, callback: () => void): void;
  trigger(eventName: string): void;
}

interface HasId {
  id?: number;
}

export class Model<T extends HasId> {
  constructor(
    private attributes: ModelAttributes<T>,
    private sync: Sync<T>,
    private events: Eventing
  ) {}

  // 为什么这种简短的语法能在这里使用，详情参考note
  on = this.events.on;
  trigger = this.events.trigger;
  get = this.attributes.get;

  set(update: T): void {
    this.attributes.set(update);
    this.events.trigger('change');
  }

  fetch(): void {
    const id = this.get('id');
    if (typeof id !== 'number') {
      throw new Error('Cannot fetch without an id!');
    }

    this.sync.fetch(id).then((responce: AxiosResponse) => {
      this.set(responce.data);
    });
  }

  save(): void {
    this.sync
      .save(this.attributes.getAll())
      .then((responce: AxiosResponse): void => {
        this.trigger('save');
      })
      .catch(() => {
        this.trigger('error');
      });
  }
}