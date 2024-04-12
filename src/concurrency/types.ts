export type PromiseRef = number;
export type MutexRef = number;
export type SelectListRef = number;

export enum PromiseStatus {
  initialised = 0,
  rest = 1,
  resolved = 2,
}

export enum ConstructTag {
  mutex = 1,
  read_channel = 2,
  write_channel = 3,
  waitgroup = 4,
  select = 5,
}
