import { Arena } from '../memory/arena';
import { PromiseT } from './promise';
import { createQueue, addQueue, deleteQueue, popQueue, isEmptyQueue } from '../utils/queue';
import {
  createCircularBuffer,
  bufferEnqueue,
  bufferDequeue,
  bufferIsEmpty,
  bufferIsFull,
} from '../utils/circular_buffer';
import { PromiseRef, ChannelRef, ConstructTag, PromiseStatus } from './types';

export class Channel {
  public readonly addr: ChannelRef;
  public readonly memory: Arena;

  public constructor(memory: Arena, addr: ChannelRef) {
    this.addr = addr;
    this.memory = memory;
  }

  public static create(memory: Arena, size: number): number {
    const addr = memory.allocateNode(3, 0);
    const buffer = createCircularBuffer(memory, size);
    const read_channel = createQueue(memory);
    const write_channel = createQueue(memory);

    memory.setChild(addr, 0, buffer);
    memory.setChild(addr, 1, read_channel);
    memory.setChild(addr, 2, write_channel);

    return addr;
  }

  public read(): PromiseRef {
    const p_addr = PromiseT.create(this.memory, this.addr, ConstructTag.channel_read);
    return p_addr;
  }

  public write(data: number): PromiseRef {
    const p_addr = PromiseT.create(this.memory, this.addr, ConstructTag.channel_write);
    const p = new PromiseT(p_addr, this.memory);
    p.setData(data);
    return p_addr;
  }

  public act_read(p_addr: PromiseRef): boolean {
    const buffer = this.memory.getChild(this.addr, 0);
    const read_channel = this.memory.getChild(this.addr, 1);
    const write_channel = this.memory.getChild(this.addr, 2);

    if (!bufferIsEmpty(this.memory, buffer)) {
      const data = bufferDequeue(this.memory, buffer);
      const p = new PromiseT(p_addr, this.memory);
      p.setData(data);
      p.setStatus(PromiseStatus.resolved);
      return true;
    } else if (!isEmptyQueue(this.memory, write_channel)) {
      const write_p_addr = popQueue(this.memory, write_channel);
      const write_p = new PromiseT(write_p_addr, this.memory);
      const data = write_p.getData();
      write_p.setData(0);
      write_p.setStatus(PromiseStatus.resolved);
      const p = new PromiseT(p_addr, this.memory);
      p.setData(data);
      p.setStatus(PromiseStatus.resolved);
      return true;
    } else {
      addQueue(this.memory, read_channel, p_addr);
      return false;
    }
  }

  public act_write(p_addr: PromiseRef): boolean {
    const buffer = this.memory.getChild(this.addr, 0);
    const read_channel = this.memory.getChild(this.addr, 1);

    const p = new PromiseT(p_addr, this.memory);
    const data = p.getData();

    if (!isEmptyQueue(this.memory, read_channel)) {
      const read_p_addr = popQueue(this.memory, read_channel);
      const read_p = new PromiseT(read_p_addr, this.memory);
      const write_p = new PromiseT(p_addr, this.memory);
      const data = write_p.getData();
      read_p.setData(data);
      read_p.setStatus(PromiseStatus.resolved);
      p.setStatus(PromiseStatus.resolved);
      return true;
    } else if (!bufferIsFull(this.memory, buffer)) {
      bufferEnqueue(this.memory, buffer, data);
      p.setData(0);
      p.setStatus(PromiseStatus.resolved);
      return true;
    } else {
      return false;
    }
  }

  public rest_read(p_addr: PromiseRef): boolean {
    const read_channel = this.memory.getChild(this.addr, 1);
    const add = addQueue(this.memory, read_channel, p_addr);
    this.memory.setChild(p_addr, 2, add);
    const p = new PromiseT(p_addr, this.memory);
    p.setStatus(PromiseStatus.rest);
    return true;
  }

  public rest_write(p_addr: PromiseRef): boolean {
    const write_channel = this.memory.getChild(this.addr, 2);
    const add = addQueue(this.memory, write_channel, p_addr);
    this.memory.setChild(p_addr, 2, add);
    const p = new PromiseT(p_addr, this.memory);
    p.setStatus(PromiseStatus.rest);
    return true;
  }

  public cancel_read(p_addr: PromiseRef): boolean {
    const read_channel = this.memory.getChild(this.addr, 1);
    const node_addr = this.memory.getChildAddr(p_addr, 2);
    deleteQueue(this.memory, read_channel, node_addr);
    return true;
  }

  public cancel_write(p_addr: PromiseRef): boolean {
    const write_channel = this.memory.getChild(this.addr, 1);
    const node_addr = this.memory.getChildAddr(p_addr, 2);
    deleteQueue(this.memory, write_channel, node_addr);
    return true;
  }
}
