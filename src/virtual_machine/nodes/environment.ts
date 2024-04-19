import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Environment {

  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, frames: number): Environment {
    const addr = memory.allocateNode(frames, 1);
    memory.setInt8(memory.getDataAddr(addr), Tag.Environment);
    return new Environment(memory, addr);
  }

  constructor(memory: Arena, address: number) {
    this.memory = memory;
    this.address = address;
  }
}