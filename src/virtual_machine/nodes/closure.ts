import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Closure {
  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, arity: number, env: number, pc: number): Closure {
    const addr = memory.allocateNode(1, 6);
    memory.setInt8(memory.getDataAddr(addr), Tag.Closure);
    memory.setUint32(memory.getDataAddr(addr) + 1, pc);
    memory.setUint8(memory.getDataAddr(addr) + 5, arity);
    memory.setChild(addr, 0, env);
    return new Closure(memory, addr);
  }

  static isClosure(memory: Arena, address: number): boolean {
    return memory.getUint8(memory.getDataAddr(address)) === Tag.Closure;
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
    return this.memory.getUint32(this.memory.getDataAddr(this.address) + 1);
  }

  public getArity(): number {
    return this.memory.getUint8(this.memory.getDataAddr(this.address) + 5);
  }
}
