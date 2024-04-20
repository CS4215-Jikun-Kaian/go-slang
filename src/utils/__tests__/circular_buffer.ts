import { createCircularBuffer, bufferEnqueue, bufferDequeue, bufferIsEmpty, bufferIsFull } from '../circular_buffer';
import { Arena } from '../../memory/arena';

describe('circular buffer', () => {
  test('successfully enqueue to circular buffer', () => {
    const memory = new Arena(8, 1000);

    const buffer = createCircularBuffer(memory, 1);
    const data = memory.allocateNode(0, 4);
    expect(bufferIsEmpty(memory, buffer)).toBe(true);
    bufferEnqueue(memory, buffer, data);
    expect(bufferIsFull(memory, buffer)).toBe(true);
    const data1 = memory.allocateNode(0, 4);
    expect(() => {
      bufferEnqueue(memory, buffer, data1);
    }).toThrow();
  });

  test('successfully dequeue from circular buffer', () => {
    const memory = new Arena(8, 1000);

    const buffer = createCircularBuffer(memory, 1);
    const data = memory.allocateNode(0, 4);
    expect(bufferIsEmpty(memory, buffer)).toBe(true);
    bufferEnqueue(memory, buffer, data);
    expect(bufferIsFull(memory, buffer)).toBe(true);
    const data1 = memory.allocateNode(0, 4);
    expect(() => {
      bufferEnqueue(memory, buffer, data1);
    }).toThrow();

    expect(bufferDequeue(memory, buffer)).toBe(data);

    expect(bufferIsEmpty(memory, buffer)).toBe(true);
    expect(() => {
      bufferDequeue(memory, buffer);
    }).toThrow();
  });

  test('successfully enqueue to full and dequeue to empty circular buffer in FIFO', () => {
    const memory = new Arena(8, 1000);

    const buffer = createCircularBuffer(memory, 5);
    const d = memory.allocateNode(0, 4);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);

    expect(bufferIsEmpty(memory, buffer)).toBe(true);
    bufferEnqueue(memory, buffer, d);
    bufferEnqueue(memory, buffer, d1);
    bufferEnqueue(memory, buffer, d2);
    bufferEnqueue(memory, buffer, d3);
    bufferEnqueue(memory, buffer, d4);
    expect(bufferIsFull(memory, buffer)).toBe(true);

    expect(bufferDequeue(memory, buffer)).toBe(d);
    expect(bufferDequeue(memory, buffer)).toBe(d1);
    expect(bufferDequeue(memory, buffer)).toBe(d2);
    expect(bufferDequeue(memory, buffer)).toBe(d3);
    expect(bufferDequeue(memory, buffer)).toBe(d4);

    expect(bufferIsEmpty(memory, buffer)).toBe(true);
  });

  test('successfully enqueue and dequeue all in limited circular buffer size', () => {
    const memory = new Arena(8, 1000);

    const buffer = createCircularBuffer(memory, 2);
    const d = memory.allocateNode(0, 4);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);

    expect(bufferIsEmpty(memory, buffer)).toBe(true);
    bufferEnqueue(memory, buffer, d);
    bufferEnqueue(memory, buffer, d1);
    expect(bufferDequeue(memory, buffer)).toBe(d);
    bufferEnqueue(memory, buffer, d2);
    expect(bufferDequeue(memory, buffer)).toBe(d1);
    bufferEnqueue(memory, buffer, d3);
    expect(bufferDequeue(memory, buffer)).toBe(d2);
    bufferEnqueue(memory, buffer, d4);
    expect(bufferDequeue(memory, buffer)).toBe(d3);
    expect(bufferDequeue(memory, buffer)).toBe(d4);
    expect(bufferIsEmpty(memory, buffer)).toBe(true);
  });
});
