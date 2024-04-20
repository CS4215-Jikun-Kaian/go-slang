import { Instruction, Context } from './types';

export interface Machine {
  LDC(instr: Instruction, ctx: Context): void;
  UNOP(instr: Instruction, ctx: Context): void;
  BINOP(instr: Instruction, ctx: Context): void;
  POP(instr: Instruction, ctx: Context): void;
  JOF(instr: Instruction, ctx: Context): void;
  GOTO(instr: Instruction, ctx: Context): void;
  ENTER_SCOPE(instr: Instruction, ctx: Context): void;
  EXIT_SCOPE(instr: Instruction, ctx: Context): void;
  LD(instr: Instruction, ctx: Context): void;
  ASSIGN(instr: Instruction, ctx: Context): void;
  LDF(instr: Instruction, ctx: Context): void;
  CALL(instr: Instruction, ctx: Context): void;
  TAIL_CALL(instr: Instruction, ctx: Context): void; // should we add this?
  RESET(instr: Instruction, ctx: Context): void;

  // Called on promise type
  AWAIT(instr: Instruction, ctx: Context): void;

  // Calling this will push the respective promise objects onto OS
  READ_CHANNEL(instr: Instruction, ctx: Context): void;
  WRITE_CHANNEL(instr: Instruction, ctx: Context): void;
  ACQUIRE_MUTEX(instr: Instruction, ctx: Context): void;
  FREE_MUTEX(instr: Instruction, ctx: Context): void;
  ADD_WAITGROUP(instr: Instruction, ctx: Context): void;
  WAIT_WAITGROUP(instr: Instruction, ctx: Context): void;

  // Takes promises on the OS and execute select onto it
  SELECT(instr: Instruction, ctx: Context): void;

  DEFAULT(instr: Instruction, ctx: Context): void

  // Spawns new goroutine at specified address
  SPAWN(instr: Instruction, ctx: Context): void;
}
