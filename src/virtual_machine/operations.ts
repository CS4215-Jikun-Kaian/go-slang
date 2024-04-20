import { RuntimeMachine } from './instructions_impl';
import { Tag, Instruction, Context } from './types';
import { push, peek, word_to_string, heap_get_tag } from './utils';
import { Channel } from '../concurrency/channel';
import { Arena } from '../memory/arena';
import { error, isBuiltin } from './nodes/builtin_fn';
import {
  isBoolean,
  isNumber,
  isUndefined,
  isNull,
  isPair,
  isUnassigned,
  isTrue,
  isFalse,
  True,
  False,
  Null,
  Undefined,
  Unassigned,
} from './nodes/nodes';
import { Closure } from './nodes/closure';

const head = (memory: Arena, pair: number) => memory.getChild(pair, 0);
const tail = (memory: Arena, pair: number) => memory.getChild(pair, 0);

const heap_allocate_Number = (memory: Arena, num: number) => {
  const address = memory.allocateNode(0, 8);
  memory.setInt8(address, Tag.Number);
  memory.setFloat64(address + 1, num);
  return address;
};

const heap_allocate_Pair = (memory: Arena, head: number, tail: number): number => {
  const pair = memory.allocateNode(2, 0);
  memory.setChild(pair, 0, head);
  memory.setChild(pair, 1, tail);
  return pair;
};

export const address_to_JS_value = (memory: Arena, x: number): any =>
  isBoolean(memory, x)
    ? isTrue(memory, x)
      ? true
      : false
    : isNumber(memory, x)
      ? memory.getFloat64(x + 1)
      : isUndefined(memory, x)
        ? undefined
        : isUnassigned(memory, x)
          ? '<unassigned>'
          : isNull(memory, x)
            ? null
            : isPair(memory, x)
              ? [address_to_JS_value(memory, memory.getChild(x, 0)), address_to_JS_value(memory, memory.getChild(x, 1))]
              : Closure.isClosure(memory, x)
                ? '<closure>'
                : isBuiltin(memory, x)
                  ? '<builtin>'
                  : 'unknown word tag: ' + word_to_string(x);

export const JS_value_to_address = (memory: Arena, x: any): any =>
  isBoolean(memory, x)
    ? x
      ? True
      : False
    : isNumber(memory, x)
      ? heap_allocate_Number(memory, x)
      : isUndefined(memory, x)
        ? Undefined
        : isNull(memory, x)
          ? Null
          : isPair(memory, x)
            ? heap_allocate_Pair(
                memory,
                JS_value_to_address(memory, head(memory, x)),
                JS_value_to_address(memory, tail(memory, x))
              )
            : 'unknown word tag: ' + word_to_string(x);

const unop_microcode = (op: string, val: any): any => {
  switch (op) {
    case '-unary':
      return -val;
    case '!':
      return !val;
    default:
      return error('unknown unary operator: ' + op);
  }
};

const binop_microcode = (op: string, v1: any, v2: any): any => {
  switch (op) {
    case '+':
      return v1 + v2;
    case '-':
      return v1 - v2;
    case '*':
      return v1 * v2;
    case '/':
      return v1 / v2;
    case '%':
      return v1 % v2;
    case '<':
      return v1 < v2;
    case '<=':
      return v1 <= v2;
    case '>=':
      return v1 >= v2;
    case '>':
      return v1 > v2;
    case '==':
      return v1 === v2;
    case '!=':
      return v1 !== v2;
    default:
      return error('unknown binary operator: ' + op);
  }
};

export const apply_unop = (memory: Arena, op: string, val: any) =>
  JS_value_to_address(memory, unop_microcode(op, address_to_JS_value(memory, val)));

export const apply_binop = (memory: Arena, op: string, v2: any, v1: any) =>
  JS_value_to_address(memory, binop_microcode(op, address_to_JS_value(memory, v1), address_to_JS_value(memory, v2)));
