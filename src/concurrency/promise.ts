import { Arena } from '../memory/arena';
import { ConstructTag, SelectListRef } from './types';
import { Mutex } from './mutex';

/**
 * Difference between act and rest
 *
 * act: Acts on promise without moving into a blocking state
 * rest: Moves the promise to a blocking state
 *
 * E.g.
 * fn lock(mutex):
 *  if (act(mutex)) // non-blocking
 *  else rest(mutex) // blocking
 *
 * This is important for getting the first promise that unblocks, such as in a select statement.
 */

// children: construct(mutex/channel/waitgroup), data, nodeAddr, selectList
// data: [type:uint8, status:boolean]
export class PromiseT {
  private readonly addr: number;
  private readonly memory: Arena;

  public constructor(addr: number, memory: Arena) {
    this.addr = addr;
    this.memory = memory;
  }

  public static create(memory: Arena, construct: number, constructTag: ConstructTag): number {
    const addr = memory.allocateNode(3, 6);
    if (addr === -1) {
      return -1;
    }
    memory.setChild(addr, 0, construct);
    memory.setChild(addr, 1, 0);
    memory.setChild(addr, 2, 0);
    memory.setChild(addr, 3, 0);

    memory.setUint8(memory.getDataAddr(addr), constructTag);
    memory.setUint8(memory.getDataAddr(addr) + 1, 0);
    return addr;
  }

  public act(): boolean {
    switch (this.memory.getUint8(this.memory.getDataAddr(this.addr))) {
      case ConstructTag.mutex:
        return new Mutex(this.memory, this.memory.getChild(this.addr, 0)).act(this.addr);
    }
    return false;
  }

  public rest(): boolean {
    switch (this.memory.getUint8(this.memory.getDataAddr(this.addr))) {
      case ConstructTag.mutex:
        return new Mutex(this.memory, this.memory.getChild(this.addr, 0)).rest(this.addr);
    }
    return false;
  }

  public cancel(): boolean {
    switch (this.memory.getUint8(this.memory.getDataAddr(this.addr))) {
      case ConstructTag.mutex:
        return new Mutex(this.memory, this.memory.getChild(this.addr, 0)).cancel(this.memory.getChild(this.addr, 2));
    }
    return false;
  }

  public getStatus(): boolean {
    return this.memory.getUint8(this.memory.getDataAddr(this.addr) + 1) === 1;
  }

  public setStatus(status: boolean): void {
    this.memory.setUint8(this.memory.getDataAddr(this.addr) + 1, status ? 1 : 0);
    // TODO: Add status change event
  }

  public setData(data: number): void {
    this.memory.setChild(this.addr, 1, data);
  }

  public setSelectList(selectList: SelectListRef): void {
    this.memory.setChild(this.addr, 3, selectList);
  }

  public getData(): number {
    return this.memory.getChild(this.addr, 1);
  }
}
