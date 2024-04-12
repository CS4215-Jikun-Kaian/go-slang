export type PromiseRef = number;
export type MutexRef = number;
export type ChannelRef = number;
export type SelectListRef = number;


export enum PromiseStatus {
  initialised = 0,
  rest = 1,
  resolved = 2,
}

export enum ConstructTag {
  mutex = 1,
  channel_read = 2,
  channel_write = 3,
  waitgroup = 4,
  select = 5,
}
