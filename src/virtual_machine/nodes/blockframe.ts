import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Blockframe {
  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, env: number): Blockframe {
    const addr = memory.allocateNode(1, 1);
    memory.setInt8(memory.getDataAddr(addr), Tag.Blockframe);
    memory.setChild(addr, 0, env);
    return new Blockframe(memory, addr);
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
}
