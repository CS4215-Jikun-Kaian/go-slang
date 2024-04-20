import { Arena } from '../memory/arena';

export type Context = {
  OS: any[];
  E: number;
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
  pos: [number, number];
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
  Loopframe = 8,
  Closure = 9,
  Frame = 10,
  Environment = 11,
  Pair = 12,
  Builtin = 13,
  String = 14,
  channel = 15,
  mutex = 16,
  waitGroup = 17,
}
