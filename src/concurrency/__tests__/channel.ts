import { Arena } from '../../memory/arena';
import { Channel } from '../channel';
import { PromiseT } from '../promise';
import { PromiseStatus } from '../types';

describe('mutex', () => {
  test('successfully block read and execute write from channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);

    const c = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);

    const r = c.read();
    const w = c.write(data);

    const pr = new PromiseT(r, memory);
    const pw = new PromiseT(w, memory);
    pr.act();

    expect(pr.getStatus()).toBe(PromiseStatus.initialised);
    expect(pw.getStatus()).toBe(PromiseStatus.initialised);
    pr.rest();
    expect(pr.getStatus()).toBe(PromiseStatus.rest);

    pw.act();

    expect(pr.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr.getData()).toBe(data);
  });

  test('successfully block write and execute read from channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);

    const c = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);

    const r = c.read();
    const w = c.write(data);

    const pr = new PromiseT(r, memory);
    const pw = new PromiseT(w, memory);
    pw.act();

    expect(pr.getStatus()).toBe(PromiseStatus.initialised);
    expect(pw.getStatus()).toBe(PromiseStatus.initialised);
    pw.rest();
    expect(pw.getStatus()).toBe(PromiseStatus.rest);

    pr.act();

    expect(pr.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr.getData()).toBe(data);
  });

  test('successfully writes with buffer capacity dont block', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 3);

    const c = new Channel(memory, c_addr);

    const d = memory.allocateNode(0, 4);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);

    const r = c.read();
    const r1 = c.read();
    const r2 = c.read();
    const r3 = c.read();
    const r4 = c.read();
    const w = c.write(d);
    const w1 = c.write(d1);
    const w2 = c.write(d2);
    const w3 = c.write(d3);
    const w4 = c.write(d4);

    const pr = new PromiseT(r, memory);
    const pr1 = new PromiseT(r1, memory);
    const pr2 = new PromiseT(r2, memory);
    const pr3 = new PromiseT(r3, memory);
    const pr4 = new PromiseT(r4, memory);
    const pw = new PromiseT(w, memory);
    const pw1 = new PromiseT(w1, memory);
    const pw2 = new PromiseT(w2, memory);
    const pw3 = new PromiseT(w3, memory);
    const pw4 = new PromiseT(w4, memory);

    pw.act();
    pw1.act();
    pw2.act();
    pw3.act();
    pw4.act();

    expect(pw.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw1.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw2.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw3.getStatus()).toBe(PromiseStatus.initialised);
    expect(pw4.getStatus()).toBe(PromiseStatus.initialised);

    pw3.rest();
    pw4.rest();

    expect(pw3.getStatus()).toBe(PromiseStatus.rest);
    expect(pw4.getStatus()).toBe(PromiseStatus.rest);

    pr.act();
    pr1.act();
    pr2.act();
    pr3.act();
    pr4.act();

    expect(pw3.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw4.getStatus()).toBe(PromiseStatus.resolved);

    expect(pr.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr1.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr2.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr3.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr4.getStatus()).toBe(PromiseStatus.resolved);

    expect(pr.getData()).toBe(d);
    expect(pr1.getData()).toBe(d1);
    expect(pr2.getData()).toBe(d2);
    expect(pr3.getData()).toBe(d3);
    expect(pr4.getData()).toBe(d4);
  });

  test('successfully writes with buffer capacity dont block', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 3);

    const c = new Channel(memory, c_addr);

    const d = memory.allocateNode(0, 4);
    const d1 = memory.allocateNode(0, 4);
    const d2 = memory.allocateNode(0, 4);
    const d3 = memory.allocateNode(0, 4);
    const d4 = memory.allocateNode(0, 4);

    const r = c.read();
    const r1 = c.read();
    const r2 = c.read();
    const r3 = c.read();
    const r4 = c.read();
    const w = c.write(d);
    const w1 = c.write(d1);
    const w2 = c.write(d2);
    const w3 = c.write(d3);
    const w4 = c.write(d4);

    const pr = new PromiseT(r, memory);
    const pr1 = new PromiseT(r1, memory);
    const pr2 = new PromiseT(r2, memory);
    const pr3 = new PromiseT(r3, memory);
    const pr4 = new PromiseT(r4, memory);
    const pw = new PromiseT(w, memory);
    const pw1 = new PromiseT(w1, memory);
    const pw2 = new PromiseT(w2, memory);
    const pw3 = new PromiseT(w3, memory);
    const pw4 = new PromiseT(w4, memory);

    pw.act();
    pw1.act();
    pw2.act();

    expect(pw.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw1.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw2.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw3.getStatus()).toBe(PromiseStatus.initialised);
    expect(pw4.getStatus()).toBe(PromiseStatus.initialised);

    pr.act();
    pr1.act();
    pr2.act();
    pr3.act();
    pr4.act();

    expect(pr.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr1.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr2.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr3.getStatus()).toBe(PromiseStatus.initialised);
    expect(pr4.getStatus()).toBe(PromiseStatus.initialised);

    expect(pr.getData()).toBe(d);
    expect(pr1.getData()).toBe(d1);
    expect(pr2.getData()).toBe(d2);

    pr3.rest();
    pr4.rest();

    expect(pr3.getStatus()).toBe(PromiseStatus.rest);
    expect(pr4.getStatus()).toBe(PromiseStatus.rest);

    pw3.act();
    pw4.act();

    expect(pr3.getStatus()).toBe(PromiseStatus.resolved);
    expect(pr4.getStatus()).toBe(PromiseStatus.resolved);

    expect(pw3.getStatus()).toBe(PromiseStatus.resolved);
    expect(pw4.getStatus()).toBe(PromiseStatus.resolved);

    expect(pr3.getData()).toBe(d3);
    expect(pr4.getData()).toBe(d4);
  });
});
