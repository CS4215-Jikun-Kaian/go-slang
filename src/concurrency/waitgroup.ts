import { Arena } from '../memory/arena';
import { PromiseT } from './promise';
import { createQueue, addQueue, deleteQueue, popQueue, isEmptyQueue } from '../utils/queue';
import { PromiseRef, WaitgroupRef, ConstructTag, PromiseStatus } from './types';

export class Waitgroup {
  public readonly addr: WaitgroupRef;
  public readonly memory: Arena;

  public constructor(memory: Arena, addr: WaitgroupRef) {
    this.addr = addr;
    this.memory = memory;
  }

  public static create(memory: Arena): number {
    const addr = memory.allocateNode(1, 4);
    const queue = createQueue(memory);
    memory.setChild(addr, 0, queue);
    memory.setUint32(memory.getDataAddr(addr), 0);
    return addr;
  }

  public wait(): PromiseRef {
    const p_addr = PromiseT.create(this.memory, this.addr, ConstructTag.waitgroup);
    return p_addr;
  }

  public add(num: number): void {
    this.memory.setUint32(
      this.memory.getDataAddr(this.addr),
      this.memory.getUint32(this.memory.getDataAddr(this.addr)) + num
    );
  }

  public done(): void {
    const count = this.memory.getUint32(this.memory.getDataAddr(this.addr));
    this.memory.setUint32(this.memory.getDataAddr(this.addr), count - 1);

    if (count === 1) {
      const queue = this.memory.getChild(this.addr, 0);
      while (!isEmptyQueue(this.memory, queue)) {
        const p_addr = popQueue(this.memory, queue);
        const p = new PromiseT(p_addr, this.memory);
        p.setStatus(PromiseStatus.resolved);
      }
    }
  }

  public act(p_addr: PromiseRef): boolean {
    if (this.memory.getUint32(this.memory.getDataAddr(this.addr)) === 0) {
      const p = new PromiseT(p_addr, this.memory);
      p.setStatus(PromiseStatus.resolved);
      return true;
    } else {
      return false;
    }
  }

  public rest(p_addr: PromiseRef): boolean {
    const queue = this.memory.getChild(this.addr, 0);
    const add = addQueue(this.memory, queue, p_addr);
    this.memory.setChild(p_addr, 2, add);
    const p = new PromiseT(p_addr, this.memory);
    p.setStatus(PromiseStatus.rest);
    return true;
  }

  public cancel(p_addr: PromiseRef): boolean {
    const queue = this.memory.getChild(this.addr, 0);
    const node_addr = this.memory.getChildAddr(p_addr, 2);
    deleteQueue(this.memory, queue, node_addr);
    return true;
  }
}
