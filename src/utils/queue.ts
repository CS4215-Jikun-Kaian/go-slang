import { Arena } from '../memory/arena';

/**
 * Queue:
 *  child: [head: addr, tail: addr]
 *
 * Node:
 *  child: [prev: addr, next: addr, data: addr]
 */

export function createQueue(memory: Arena): number {
  const addr = memory.allocateNode(2, 0);

  return addr;
}

function getHead(memory: Arena, queue: number): number {
  return memory.getChild(queue, 0);
}

function getTail(memory: Arena, queue: number): number {
  return memory.getChild(queue, 1);
}

function getPrev(memory: Arena, node: number): number {
  return memory.getChild(node, 0);
}

function getNext(memory: Arena, node: number): number {
  return memory.getChild(node, 1);
}

export function addQueue(memory: Arena, list: number, data: number): number {
  let newNode = memory.allocateNode(3, 0);
  memory.setChild(newNode, 2, data);
  memory.setChild(newNode, 1, -1);
  if (getTail(memory, list) === -1) {
    memory.setChild(list, 1, newNode);
    memory.setChild(list, 0, newNode);
    memory.setChild(newNode, 0, -1);
    memory.setChild(newNode, 1, -1);
  } else {
    memory.setChild(newNode, 0, getTail(memory, list));
    memory.setChild(getTail(memory, list), 1, newNode);
  }
  memory.setChild(list, 1, newNode);
  return newNode;
}

export function deleteQueue(memory: Arena, queue: number, node: number): void {
  if (node <= 0) {
    throw new Error('Invalid node');
  }

  if (getHead(memory, queue) === node) {
    memory.setChild(queue, 0, getNext(memory, node));
  }

  if (getTail(memory, queue) === node) {
    memory.setChild(queue, 1, getPrev(memory, node));
  }

  if (getPrev(memory, node) !== -1) {
    memory.setChild(getPrev(memory, node), 1, getNext(memory, node));
  }

  if (getNext(memory, node) !== -1) {
    memory.setChild(getNext(memory, node), 0, getPrev(memory, node));
  }
}

export function popQueue(memory: Arena, queue: number) {
  let node = getHead(memory, queue);
  if (node <= 0) {
    throw new Error('Pop from empty queue');
  }

  let next = getNext(memory, node);
  memory.setChild(queue, 0, next);
  return memory.getChild(node, 2);
}

export function isEmptyQueue(memory: Arena, queue: number): boolean {
  return getHead(memory, queue) === -1;
}
