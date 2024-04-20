import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Callframe {
  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, env: number, pc: number): Callframe {
    const addr = memory.allocateNode(1, 5);
    memory.setInt8(memory.getDataAddr(addr), Tag.Blockframe);
    memory.setInt32(memory.getDataAddr(addr) + 1, pc);
    memory.setChild(addr, 0, env);
    return new Callframe(memory, addr);
  }

  static isCallframe(memory: Arena, address: number): boolean {
    return memory.getInt8(memory.getDataAddr(address)) === Tag.Callframe;
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

  public getPc(): number {
    return this.memory.getInt32(this.memory.getDataAddr(this.address) + 1);
  }
}
