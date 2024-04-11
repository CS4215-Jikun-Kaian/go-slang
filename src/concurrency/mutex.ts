import { Arena } from '../memory/arena';
import { PromiseT } from './promise';
import { createQueue, addQueue, deleteQueue, popQueue, isEmptyQueue } from '../utils/queue';
import { PromiseRef, MutexRef, ConstructTag } from './types';

export class Mutex {
  public readonly addr: MutexRef;
  public readonly memory: Arena;
  public static childrenNum: number = 1; // [queue : address]
  public static dataSize: number = 5; // [locked : boolean]

  public constructor(memory: Arena, addr: MutexRef) {
    this.addr = addr;
    this.memory = memory;
  }

  private setLocked(locked: boolean): void {
    if (locked) {
      this.memory.setUint8(this.memory.getDataAddr(this.addr), 1);
    } else {
      this.memory.setUint8(this.memory.getDataAddr(this.addr), 0);
    }
  }

  public getLocked(): boolean {
    return this.memory.getUint8(this.memory.getDataAddr(this.addr)) === 1;
  }

  public static create(memory: Arena): number {
    const addr = memory.allocateNode(1, 1);
    const queue = createQueue(memory);
    memory.setChild(addr, 0, queue);
    memory.setUint8(memory.getDataAddr(addr), 0);
    return addr;
  }

  public lock(): PromiseRef {
    const p_addr = PromiseT.create(this.memory, this.addr, ConstructTag.mutex);
    return p_addr;
  }

  public release(): void {
    const queue = this.memory.getChild(this.addr, 0);
    if (!isEmptyQueue(this.memory, queue)) {
      const p_addr = popQueue(this.memory, queue);
      const p = new PromiseT(p_addr, this.memory);
      p.setStatus(true);
    } else if (this.getLocked()) {
      this.setLocked(false);
    }
  }

  public act(p_addr: PromiseRef): boolean {
    if (this.getLocked()) {
      return false;
    } else {
      this.setLocked(true);
      const p = new PromiseT(p_addr, this.memory);
      p.setStatus(true);
      return true;
    }
  }

  public rest(p_addr: PromiseRef): boolean {
    const queue = this.memory.getChild(this.addr, 0);
    const add = addQueue(this.memory, queue, p_addr);
    this.memory.setChild(p_addr, 2, add);
    return true;
  }

  public cancel(node_addr: PromiseRef): boolean {
    const queue = this.memory.getChild(this.addr, 0);
    deleteQueue(this.memory, queue, node_addr);
    return true;
  }
}
