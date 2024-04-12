import { Arena } from '../../memory/arena';
import { Waitgroup } from '../waitgroup';
import { PromiseT } from '../promise';
import { PromiseStatus } from '../types';

describe('mutex', () => {
  test('successfully executes on empty wait group', () => {
    const memory = new Arena(8, 1000);
    const wg_addr = Waitgroup.create(memory);
    const waitgroup = new Waitgroup(memory, wg_addr);
    const p_addr = waitgroup.wait();
    const p = new PromiseT(p_addr, memory);

    expect(p.getStatus()).toBe(PromiseStatus.initialised);
    p.act();

    expect(p.getStatus()).toBe(PromiseStatus.resolved);
  });

  test('successfully blocks on non-empty wait group', () => {
    const memory = new Arena(8, 1000);
    const wg_addr = Waitgroup.create(memory);
    const waitgroup = new Waitgroup(memory, wg_addr);
    const p_addr = waitgroup.wait();
    const p = new PromiseT(p_addr, memory);
    waitgroup.add(1);

    expect(p.getStatus()).toBe(PromiseStatus.initialised);
    p.act();

    expect(p.getStatus()).toBe(PromiseStatus.initialised);

    p.rest();
    expect(p.getStatus()).toBe(PromiseStatus.rest);

    waitgroup.done();

    expect(p.getStatus()).toBe(PromiseStatus.resolved);
  });

  test('successfully blocks with more than one waits', () => {
    const memory = new Arena(8, 1000);
    const wg_addr = Waitgroup.create(memory);
    const waitgroup = new Waitgroup(memory, wg_addr);
    const p_addr = waitgroup.wait();
    const p = new PromiseT(p_addr, memory);
    waitgroup.add(2);

    expect(p.getStatus()).toBe(PromiseStatus.initialised);
    p.act();

    expect(p.getStatus()).toBe(PromiseStatus.initialised);

    p.rest();
    expect(p.getStatus()).toBe(PromiseStatus.rest);

    waitgroup.done();

    expect(p.getStatus()).toBe(PromiseStatus.rest);

    waitgroup.done();

    expect(p.getStatus()).toBe(PromiseStatus.resolved);
  });
});
