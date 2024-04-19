import { Arena } from "../memory/arena";

export type Context = {
  OS: any[];
  E: any[];
  PC: number;
  RTS: any[];
  heap: Arena;
};

export type Instruction = {
  type: string;
  val: any;
  sym: string;
  addr: number;
  num: number;
  arity: number;
  pos: number;
};

export enum Tag {
  False = 0,
  True = 1,
  Number = 2,
  Null = 3,
  Unassigned = 4,
  Undefined = 5,
  Blockframe = 6,
  Callframe = 7,
  Closure = 8,
  Frame = 9,
  Environment = 10,
  Pair = 11,
  Builtin = 12,
  String = 13,
  channel = 14,
  mutex = 15,
  waitGroup = 16,
}