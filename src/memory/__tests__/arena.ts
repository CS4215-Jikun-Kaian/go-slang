import { Arena } from '../arena';

describe('arena', () => {
  test('successfully allocates after garbage collection', () => {
    const arena = new Arena(8, 24);
    expect(arena.allocateNode(0, 4)).toBe(12);
    expect(arena.allocateNode(0, 4)).toBe(-1);
    arena.sweep();
    expect(arena.allocateNode(0, 4)).toBe(12);
  });

  test('does not garbage collect marked nodes', () => {
    const arena = new Arena(8, 48);
    expect(arena.allocateNode(0, 4)).toBe(12);
    expect(arena.allocateNode(0, 4)).toBe(36);
    expect(arena.allocateNode(0, 4)).toBe(-1);
    arena.mark(12);
    arena.sweep();
    expect(arena.allocateNode(0, 4)).toBe(36);
    expect(arena.allocateNode(0, 4)).toBe(-1);
    arena.mark(36);
    arena.sweep();
    expect(arena.allocateNode(0, 4)).toBe(12);
    expect(arena.allocateNode(0, 4)).toBe(-1);
  });

  test('children of marked nodes will also be marked', () => {
    const arena = new Arena(8, 104);
    expect(arena.allocateNode(0, 4)).toBe(12);
    expect(arena.allocateNode(1, 4)).toBe(36);
    expect(arena.allocateNode(1, 4)).toBe(64);
    arena.setChild(36, 0, 64);
    expect(arena.allocateNode(0, 4)).toBe(92);
    arena.setChild(64, 0, 92);
    expect(arena.allocateNode(0, 4)).toBe(-1);
    arena.mark(36);
    arena.sweep();
    expect(arena.allocateNode(0, 4)).toBe(12);
  });

  test('children of unmarked nodes will also be freed', () => {
    const arena = new Arena(8, 104);
    expect(arena.allocateNode(0, 4)).toBe(12);
    expect(arena.allocateNode(1, 4)).toBe(36);
    expect(arena.allocateNode(1, 4)).toBe(64);
    arena.setChild(36, 0, 64);
    expect(arena.allocateNode(0, 4)).toBe(92);
    arena.setChild(64, 0, 92);
    expect(arena.allocateNode(0, 4)).toBe(-1);
    arena.mark(12);
    arena.sweep();
    expect(arena.allocateNode(1, 4)).toBe(36);
    expect(arena.allocateNode(1, 4)).toBe(64);
    expect(arena.allocateNode(0, 4)).toBe(92);
  });
});
