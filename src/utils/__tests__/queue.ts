import { createQueue, addQueue, deleteQueue, popQueue, isEmptyQueue } from '../queue';
import { Arena } from '../../memory/arena';

describe('queue', () => {
  test('successfully add to queue', () => {
    const memory = new Arena(8, 1000);
    const queue = createQueue(memory);
    const data = memory.allocateNode(0, 4);
    addQueue(memory, queue, data);
    expect(memory.getChild(queue, 0)).toBe(memory.getChild(queue, 1));
  });

  test('successfully delete from queue', () => {
    const memory = new Arena(8, 1000);
    const queue = createQueue(memory);
    const data = memory.allocateNode(0, 4);
    const addr = addQueue(memory, queue, data);
    expect(memory.getChild(queue, 0)).toBe(memory.getChild(queue, 1));
    deleteQueue(memory, queue, addr);
    expect(memory.getChild(queue, 0)).toBe(-1);
    expect(memory.getChild(queue, 1)).toBe(-1);
    expect(isEmptyQueue(memory, queue)).toBe(true);
  });

  test('successfully pop from queue', () => {
    const memory = new Arena(8, 1000);
    const queue = createQueue(memory);
    const data = memory.allocateNode(0, 4);
    addQueue(memory, queue, data);
    expect(memory.getChild(queue, 0)).toBe(memory.getChild(queue, 1));

    const addr = popQueue(memory, queue);
    expect(addr).toBe(data);
    expect(isEmptyQueue(memory, queue)).toBe(true);
  });

  test('successfully pop many from queue', () => {
    const memory = new Arena(8, 1000);
    const queue = createQueue(memory);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);
    const d5 = memory.allocateNode(0, 4);
    addQueue(memory, queue, d1);
    addQueue(memory, queue, d2);
    addQueue(memory, queue, d3);
    addQueue(memory, queue, d4);
    addQueue(memory, queue, d5);

    expect(popQueue(memory, queue)).toBe(d1);
    expect(popQueue(memory, queue)).toBe(d2);
    expect(popQueue(memory, queue)).toBe(d3);
    expect(popQueue(memory, queue)).toBe(d4);
    expect(popQueue(memory, queue)).toBe(d5);
    expect(isEmptyQueue(memory, queue)).toBe(true);
  });

  test('successfully pop and delete many from queue', () => {
    const memory = new Arena(8, 1000);
    const queue = createQueue(memory);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);
    const d5 = memory.allocateNode(0, 4);

    const a1 = addQueue(memory, queue, d1);
    const a2 = addQueue(memory, queue, d2);
    const a3 = addQueue(memory, queue, d3);
    const a4 = addQueue(memory, queue, d4);
    const a5 = addQueue(memory, queue, d5);

    deleteQueue(memory, queue, a1);
    deleteQueue(memory, queue, a3);
    deleteQueue(memory, queue, a5);

    expect(popQueue(memory, queue)).toBe(d2);
    expect(popQueue(memory, queue)).toBe(d4);
    expect(isEmptyQueue(memory, queue)).toBe(true);
  });
});
