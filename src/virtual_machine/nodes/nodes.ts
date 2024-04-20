import { Arena } from '../../memory/arena';
import { Tag } from '../types';
import { heap_get_tag } from '../utils';

export let False: number;
export const isFalse = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.False;
export let True: number;
export const isTrue = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.True;

export const isBoolean = (memory: Arena, address: number) => isTrue(memory, address) || isFalse(memory, address);

export let Null: number;
export const isNull = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Null;

export let Unassigned: number;
export const isUnassigned = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Unassigned;

export let Undefined: number;
export const isUndefined = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Undefined;

export const isNumber = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Number;

export const isString = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.String;

export const isPair = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Pair;

export const allocate_literal_values = (memory: Arena) => {
  False = memory.allocateNode(0, 1);
  memory.setInt8(False, Tag.False);
  True = memory.allocateNode(0, 1);
  memory.setInt8(False, Tag.True);
  Null = memory.allocateNode(0, 1);
  memory.setInt8(False, Tag.Null);
  Unassigned = memory.allocateNode(0, 1);
  memory.setInt8(False, Tag.Unassigned);
  Undefined = memory.allocateNode(0, 1);
  memory.setInt8(False, Tag.Undefined);
};
