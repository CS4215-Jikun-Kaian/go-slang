import { Arena } from '../../memory/arena';
import { Tag, Instruction, Context } from '../types';
import { push, peek, word_to_string, heap_get_tag } from '../utils';
import { address_to_JS_value } from '../operations';

export const error = (e: string) => {
  throw new Error(e);
};



export const builtin_implementation = {
  print: (memory: Arena, ctx: Context, instr: Instruction) => {
    const address = ctx.OS.pop();
    console.log(address_to_JS_value(memory, address));
    return address;
  },
  error: (memory: Arena, ctx: Context, instr: Instruction) => error(address_to_JS_value(memory, ctx.OS.pop())),
  make: (memory: Arena, ctx: Context, instr: Instruction) => {

  }
};

export const isBuiltin = (memory: Arena, address: number) => heap_get_tag(memory, address) === Tag.Builtin;

export const apply_builtin = (memory: Arena, ctx: Context, fun: number) => {
  
}


