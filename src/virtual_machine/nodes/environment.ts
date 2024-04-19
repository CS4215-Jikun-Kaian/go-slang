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

  public getAddress(): number {
    return this.address;
  }

  public getFrame(index: number): number {
    return this.memory.getChild(this.address, index);
  }

  public setFrame(index: number, frame: number): void {
    this.memory.setChild(this.address, index, frame);
  }

  public extend(frame: number): Environment {
    const old_size = this.memory.getNumberofChildren(this.address);
    const new_env = Environment.allocate(this.memory, old_size+1);
    for (let i = 0; i < old_size; i++) {
      this.memory.setChild(new_env.getAddress(), i, this.getFrame(i));
    }
    this.memory.setChild(new_env.getAddress(), old_size, frame);
    return new_env;
  }
}
