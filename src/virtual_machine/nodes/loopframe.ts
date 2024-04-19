import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Loopframe {
  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, env: number, continue_pc: number, break_pc: number): Loopframe {
    const addr = memory.allocateNode(1, 9);
    memory.setInt8(memory.getDataAddr(addr), Tag.Blockframe);
    memory.setInt32(memory.getDataAddr(addr) + 1, continue_pc);
    memory.setInt32(memory.getDataAddr(addr) + 5, break_pc);
    memory.setChild(addr, 0, env);
    return new Loopframe(memory, addr);
  }

  constructor(memory: Arena, address: number) {
    this.memory = memory;
    this.address = address;
  }

  public getAddress(): number {
    return this.address;
  }

  public getEnv(): number {
    return this.memory.getChild(this.address, 0);
  }

  public getContinuePc(): number {
    return this.memory.getInt32(this.memory.getDataAddr(this.address) + 1);
  }

  public getBreakPc(): number {
    return this.memory.getInt32(this.memory.getDataAddr(this.address) + 5);
  }
}
