import { Instruction, Context } from './types';
import { push } from './utils';
import { Machine } from './instructions';
import { JS_value_to_address, address_to_JS_value, isBuiltin } from './operations';
import { error } from './nodes/builtin_fn';
import { Arena } from '../memory/arena';
import { Frame } from './nodes/frame';
import { Callframe } from './nodes/callframe';
import { Blockframe } from './nodes/blockframe';
import { Environment } from './nodes/environment';
import { Loopframe } from './nodes/loopframe';
import { Unassigned, isUnassigned } from './nodes/nodes';

import { apply_unop, apply_binop } from './operations';
import { Closure } from './nodes/closure';

export class RuntimeMachine implements Machine {
  static memory: Arena;

  LDC(instr: Instruction, ctx: Context): void {
    push(ctx.OS, JS_value_to_address(RuntimeMachine.memory, instr.val));
  }

  UNOP(instr: Instruction, ctx: Context): void {
    push(ctx.OS, apply_unop(RuntimeMachine.memory, instr.sym, ctx.OS.pop()));
  }

  BINOP(instr: Instruction, ctx: Context): void {
    push(ctx.OS, apply_binop(RuntimeMachine.memory, instr.sym, ctx.OS.pop(), ctx.OS.pop()));
  }

  POP(instr: Instruction, ctx: Context): void {
    ctx.OS.pop();
  }

  JOF(instr: Instruction, ctx: Context): void {
    ctx.PC = address_to_JS_value(RuntimeMachine.memory, ctx.OS.pop()) ? ctx.PC : instr.addr;
  }

  GOTO(instr: Instruction, ctx: Context): void {
    ctx.PC = instr.addr;
  }

  ENTER_SCOPE(instr: Instruction, ctx: Context): void {
    push(ctx.RTS, Blockframe.allocate(RuntimeMachine.memory, ctx.E).getAddress());
    const frame = Frame.allocate(RuntimeMachine.memory, instr.num);
    const frame_address = frame.getAddress();
    ctx.E = new Environment(RuntimeMachine.memory, ctx.E).extend(frame_address).getAddress();
    for (let i = 0; i < instr.num; i++) {
      frame.setValue(i, Unassigned);
    }
  }

  EXIT_SCOPE(instr: Instruction, ctx: Context): void {
    const blockframe = new Blockframe(RuntimeMachine.memory, ctx.RTS.pop());
    ctx.E = blockframe.getEnv();
  }

  LD(instr: Instruction, ctx: Context): void {
    const e = new Environment(RuntimeMachine.memory, ctx.E);
    const val = e.getValue(instr.pos);
    if (isUnassigned(RuntimeMachine.memory, val)) error('access of unassigned variable');
    push(ctx.OS, val);
  }

  ASSIGN(instr: Instruction, ctx: Context): void {
    const e = new Environment(RuntimeMachine.memory, ctx.E);
    e.setValue(instr.pos, ctx.OS.pop());
  }

  LDF(instr: Instruction, ctx: Context): void {
    const closure_address = Closure.allocate(RuntimeMachine.memory, instr.arity, instr.addr, ctx.E).getAddress();
    push(ctx.OS, closure_address);
  }

  CALL(instr: Instruction, ctx: Context): void {
    const arity = instr.arity;
    const new_frame = Frame.allocate(RuntimeMachine.memory, arity);
    for (let i = arity - 1; i >= 0; i--) {
      new_frame.setValue(i, ctx.OS.pop());
    }
    const fun = ctx.OS.pop();
    if (isBuiltin(RuntimeMachine.memory, fun)) {
      return applyBuiltin(fun);
    }
    const new_PC = RuntimeMachine.memory.get_Closure_pc(fun);
    ctx.OS.pop(); // pop fun
    push(ctx.RTS, RuntimeMachine.memory.allocate_Callframe(ctx.E, ctx.PC));
    ctx.E = RuntimeMachine.memory.extend_Environment(new_frame, RuntimeMachine.memory.get_Closure_environment(fun));
    ctx.PC = new_PC;
  }

  RESET(instr: Instruction, ctx: Context): void {
    // keep popping...
    const top_frame = RTS.pop();
    if (is_Callframe(top_frame)) {
      // ...until top frame is a call frame
      PC = heap_get_Callframe_pc(top_frame);
      E = heap_get_Callframe_environment(top_frame);
    } else {
      PC--;
    }
  }
}
