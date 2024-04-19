import { Arena } from '../../memory/arena';
import { Tag } from '../types';

export class Frame {

  public memory: Arena;
  public address: number;

  static allocate(memory: Arena, values: number): Frame {
    const addr = memory.allocateNode(values, 1);
    memory.setInt8(memory.getDataAddr(addr), Tag.Frame);
    return new Frame(memory, addr);
  }

  static isFrame(memory: Arena, address: number): boolean {
    return memory.getInt8(memory.getDataAddr(address)) === Tag.Frame;
  }

  constructor(memory: Arena, address: number) {
    this.memory = memory;
    this.address = address;
  }

  public getAddress(): number {
    return this.address;
  }

  public setValue(index: number, value: number): void {
    this.memory.setChild(this.address, index, value);
  }

  public getValue(index: number): number {
    return this.memory.getChild(this.address, index);
  }
}