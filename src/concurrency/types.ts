export type PromiseRef = number;
export type MutexRef = number;
export type SelectListRef = number;

export enum PromiseStatus {
  pending = 0,
  evaluated = 1,
  resolved = 2,
}

export enum ConstructTag {
  mutex = 1,
  channel = 2,
  waitgroup = 3,
  select = 4,
}
