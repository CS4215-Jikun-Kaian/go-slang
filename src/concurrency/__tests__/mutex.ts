import { Arena } from '../../memory/arena';
import { Mutex } from '../mutex';
import { PromiseT } from '../promise';

describe('mutex', () => {
  test('successfully locks a free mutex', () => {
    const memory = new Arena(8, 1000);
    const m_addr = Mutex.create(memory);
    const mutex = new Mutex(memory, m_addr);
    const p_addr = mutex.lock();
    const p = new PromiseT(p_addr, memory);

    expect(p.getStatus()).toBe(false);
    p.act();

    expect(p.getStatus()).toBe(true);
    expect(mutex.getLocked()).toBe(true);
  });

  test('unsuccessfully locks a locked mutex', () => {
    const memory = new Arena(8, 1000);
    const m_addr = Mutex.create(memory);
    const mutex = new Mutex(memory, m_addr);
    const p_addr = mutex.lock();
    const p = new PromiseT(p_addr, memory);

    expect(p.getStatus()).toBe(false);
    p.act();

    expect(p.getStatus()).toBe(true);
    expect(mutex.getLocked()).toBe(true);

    const p1_addr = mutex.lock();
    const p1 = new PromiseT(p1_addr, memory);
    p1.act();

    expect(mutex.getLocked()).toBe(true);
    expect(p1.getStatus()).toBe(false);
  });

  test('successfully to releases a locked mutex', () => {
    const memory = new Arena(8, 1000);
    const m_addr = Mutex.create(memory);
    const mutex = new Mutex(memory, m_addr);
    const p_addr = mutex.lock();
    const p = new PromiseT(p_addr, memory);

    expect(p.getStatus()).toBe(false);
    p.act();

    expect(p.getStatus()).toBe(true);
    expect(mutex.getLocked()).toBe(true);

    mutex.release();
    expect(mutex.getLocked()).toBe(false);
  });

  test('next promise immediately locks a released mutex', () => {
    const memory = new Arena(8, 1000);
    const m_addr = Mutex.create(memory);
    const mutex = new Mutex(memory, m_addr);
    const p_addr = mutex.lock();
    const p = new PromiseT(p_addr, memory);

    expect(p.getStatus()).toBe(false);
    p.act();

    expect(p.getStatus()).toBe(true);
    expect(mutex.getLocked()).toBe(true);

    const p1_addr = mutex.lock();
    const p1 = new PromiseT(p1_addr, memory);
    p1.act();
    p1.rest();

    mutex.release();
    expect(mutex.getLocked()).toBe(true);
    expect(p1.getStatus()).toBe(true);

    mutex.release();
  });

  test('next promise locks released mutex in FIFO order', () => {
    const memory = new Arena(8, 1000);
    const m_addr = Mutex.create(memory);
    const mutex = new Mutex(memory, m_addr);
    const p_addr = mutex.lock();
    const p = new PromiseT(p_addr, memory);
    const p1_addr = mutex.lock();
    const p1 = new PromiseT(p1_addr, memory);
    const p2_addr = mutex.lock();
    const p2 = new PromiseT(p2_addr, memory);
    const p3_addr = mutex.lock();
    const p3 = new PromiseT(p3_addr, memory);
    const p4_addr = mutex.lock();
    const p4 = new PromiseT(p4_addr, memory);

    expect(p.getStatus()).toBe(false);

    p.act();
    p1.rest();
    p2.rest();
    p3.rest();
    p4.rest();

    expect(p.getStatus()).toBe(true);
    expect(mutex.getLocked()).toBe(true);
    expect(p1.getStatus()).toBe(false);

    mutex.release();
    expect(mutex.getLocked()).toBe(true);
    expect(p1.getStatus()).toBe(true);
    expect(p2.getStatus()).toBe(false);

    mutex.release();
    expect(mutex.getLocked()).toBe(true);
    expect(p2.getStatus()).toBe(true);
    expect(p3.getStatus()).toBe(false);

    mutex.release();
    expect(mutex.getLocked()).toBe(true);
    expect(p3.getStatus()).toBe(true);
    expect(p4.getStatus()).toBe(false);

    mutex.release();
    expect(mutex.getLocked()).toBe(true);
    expect(p4.getStatus()).toBe(true);

    mutex.release();
    expect(mutex.getLocked()).toBe(false);
  });
});
