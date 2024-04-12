import { Arena } from '../memory/arena';

export function createCircularBuffer(memory: Arena, size: number): number {
  const addr = memory.allocateNode(size + 1, 8);
  memory.setUint32(memory.getDataAddr(addr), 0);
  memory.setUint32(memory.getDataAddr(addr) + 4, 0);
  return addr;
}

export function bufferIsFull(memory: Arena, buffer: number): boolean {
  const head = memory.getUint32(memory.getDataAddr(buffer));
  const tail = memory.getUint32(memory.getDataAddr(buffer) + 4);
  return (tail + 1) % memory.getNumberofChildren(buffer) === head;
}

export function bufferIsEmpty(memory: Arena, buffer: number): boolean {
  const head = memory.getUint32(memory.getDataAddr(buffer));
  const tail = memory.getUint32(memory.getDataAddr(buffer) + 4);
  return head === tail;
}

export function bufferEnqueue(memory: Arena, buffer: number, data: number): void {
  if (bufferIsFull(memory, buffer)) {
    throw new Error('Buffer is full');
  }

  const tail = memory.getUint32(memory.getDataAddr(buffer) + 4);
  memory.setChild(buffer, tail, data);
  memory.setUint32(memory.getDataAddr(buffer) + 4, (tail + 1) % memory.getNumberofChildren(buffer));
}

export function bufferDequeue(memory: Arena, buffer: number): number {
  if (bufferIsEmpty(memory, buffer)) {
    throw new Error('Buffer is empty');
  }

  const head = memory.getUint32(memory.getDataAddr(buffer));
  const data = memory.getChild(buffer, head);
  memory.setUint32(memory.getDataAddr(buffer), (head + 1) % memory.getNumberofChildren(buffer));
  return data;
}
