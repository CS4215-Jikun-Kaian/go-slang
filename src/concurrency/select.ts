import { Arena } from '../memory/arena';
import { PromiseT } from './promise';
// import { createQueue, addQueue, deleteQueue, popQueue, isEmptyQueue } from '../utils/queue';
import { PromiseRef, SelectRef, ConstructTag, PromiseStatus } from './types';

export class Select {
  public readonly addr: SelectRef;
  public readonly memory: Arena;

  public constructor(memory: Arena, addr: SelectRef) {
    this.addr = addr;
    this.memory = memory;
  }

  public static create(memory: Arena, promises: number[]): number {
    const addr = memory.allocateNode(2, 0);
    const p_addrs = memory.allocateNode(promises.length, 0);
    memory.setChild(addr, 0, p_addrs);

    // randomise order
    for (let i = promises.length - 1; i > 0; i--) {
      const temp = promises[i];
      const j = Math.floor(Math.random() * (i + 1));
      promises[i] = promises[j];
      promises[j] = temp;
    }

    for (let i = 0; i < promises.length; i++) {
      memory.setChild(p_addrs, i, promises[i]);
      const p = new PromiseT(promises[i], memory);
      p.setSelect(addr);
    }

    const select_promise = PromiseT.create(memory, addr, ConstructTag.select);

    memory.setChild(addr, 1, select_promise); // satisfied promise
    return select_promise;
  }

  public fulfill(): void {
    const select_promise = new PromiseT(this.memory.getChild(this.addr, 1), this.memory);
    const rested = select_promise.getStatus() === PromiseStatus.rest;
    for (let i = 0; i < this.memory.getNumberofChildren(this.memory.getChild(this.addr, 0)); i++) {
      const p_addr = this.memory.getChild(this.memory.getChild(this.addr, 0), i);
      const p = new PromiseT(p_addr, this.memory);
      if (p.getStatus() === PromiseStatus.resolved) {
        select_promise.setData(p.getData());
        select_promise.setStatus(PromiseStatus.resolved);
      } else {
        if (rested) {
          p.cancel();
        }
      }
    }
  }

  public act(): boolean {
    const promises = this.memory.getChild(this.addr, 0);

    for (let i = 0; i < this.memory.getNumberofChildren(promises); i++) {
      const p_addr = this.memory.getChild(promises, i);
      const p = new PromiseT(p_addr, this.memory);
      if (p.act()) {
        return true;
      }
    }

    return false;
  }

  public rest(): boolean {
    const promises = this.memory.getChild(this.addr, 0);

    for (let i = 0; i < this.memory.getNumberofChildren(promises); i++) {
      const p_addr = this.memory.getChild(promises, i);
      const p = new PromiseT(p_addr, this.memory);
      p.rest();
    }
    const p = new PromiseT(this.memory.getChild(this.addr, 1), this.memory);
    p.setStatus(PromiseStatus.rest);
    return true;
  }

  public cancel(): boolean {
    throw new Error('Not implemented');
  }
}
