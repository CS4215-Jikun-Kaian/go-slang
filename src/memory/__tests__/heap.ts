import { Heap } from '../heap';

describe('heap', () => {
  test('returns addresses when there is enough space', () => {
    const heap = new Heap(4, 8);
    expect(heap.allocate(4)).toBe(8);
    expect(heap.allocate(4)).toBe(-1);
  });

  test('returns -1 when there is not enough space', () => {
    const heap = new Heap(4, 8);
    expect(heap.allocate(4)).toBe(8);
    expect(heap.allocate(4)).toBe(-1);
  });

  test('frees space when passed a valid address', () => {
    const heap = new Heap(4, 16);
    expect(heap.allocate(4)).toBe(8);
    expect(heap.allocate(4)).toBe(16);
    expect(heap.allocate(4)).toBe(-1);
    heap.free(8);
    expect(heap.allocate(4)).toBe(8);
    expect(heap.allocate(4)).toBe(-1);
    heap.free(16);
    expect(heap.allocate(4)).toBe(16);
    expect(heap.allocate(4)).toBe(-1);

  });

  test('returns -1 if the available free space is fragmented', () => {
    const heap = new Heap(4, 800);
    expect(heap.allocate(500)).toBe(8);
    expect(heap.allocate(200)).toBe(512);
    heap.free(8);
    expect(heap.allocate(300)).toBe(8);
    expect(heap.allocate(300)).toBe(-1);
    expect(heap.allocate(160)).toBe(312);
  });

  test('returns address if fragmented free space is merged', () => {
    const heap = new Heap(4, 48);
    expect(heap.allocate(4)).toBe(8);
    expect(heap.allocate(4)).toBe(16);
    expect(heap.allocate(4)).toBe(24);
    expect(heap.allocate(4)).toBe(32);
    heap.free(8);
    heap.free(24);
    heap.free(16);
    expect(heap.allocate(20)).toBe(8);
  });
});

