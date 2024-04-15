import { Arena } from '../../memory/arena';
import { PromiseT } from '../promise';
import { Channel } from '../channel';
import { Select } from '../select';
import { PromiseStatus } from '../types';

describe('select', () => {
  test('successfully selects a non-blocking write channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 1);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const p_addr = channel.write(data);

    const s_addr = Select.create(memory, [p_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    const pr_addr = channel.read();
    const pr = new PromiseT(pr_addr, memory);

    pr.act();

    expect(memory.getInt32(memory.getDataAddr(pr.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });

  test('successfully selects a blocking write channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pw_addr = channel.write(data);

    const s_addr = Select.create(memory, [pw_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.initialised);

    select.rest();

    expect(select.getStatus()).toBe(PromiseStatus.rest);

    const pr_addr = channel.read();
    const pr = new PromiseT(pr_addr, memory);

    pr.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(pr.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });

  test('successfully selects a non-blocking read channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pw_addr = channel.write(data);
    const pw = new PromiseT(pw_addr, memory);

    pw.rest();

    const pr_addr = channel.read();

    const s_addr = Select.create(memory, [pr_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(select.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });

  test('successfully selects a blocking read channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pr_addr = channel.read();

    const s_addr = Select.create(memory, [pr_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.initialised);

    select.rest();

    expect(select.getStatus()).toBe(PromiseStatus.rest);

    const pw_addr = channel.write(data);
    const pw = new PromiseT(pw_addr, memory);

    pw.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(select.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });

  test('successfully cancels read from blocking read and write channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pr_addr = channel.read();
    const pw_addr = channel.write(data);

    const s_addr = Select.create(memory, [pr_addr, pw_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.initialised);

    select.rest();

    expect(select.getStatus()).toBe(PromiseStatus.rest);

    const data1 = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 2345);

    const pw_addr1 = channel.write(data1);
    const pw1 = new PromiseT(pw_addr1, memory);

    pw1.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(select.getData()))).toBe(memory.getInt32(memory.getDataAddr(data1)));
  });

  test('successfully cancels read from non-blocking read and write channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 4);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pr_addr = channel.read();
    const pw_addr = channel.write(data);

    const s_addr = Select.create(memory, [pr_addr, pw_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    const pr_addr1 = channel.read();
    const pr1 = new PromiseT(pr_addr1, memory);

    pr1.act();

    expect(pr1.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(pr1.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });

  test('successfully cancels write from blocking read and write channel', () => {
    const memory = new Arena(8, 1000);
    const c_addr = Channel.create(memory, 0);
    const channel = new Channel(memory, c_addr);

    const data = memory.allocateNode(0, 4);
    memory.setInt32(memory.getDataAddr(data), 1234);

    const pr_addr = channel.read();
    const pw_addr = channel.write(data);

    const s_addr = Select.create(memory, [pr_addr, pw_addr]);
    const select = new PromiseT(s_addr, memory);

    select.act();

    expect(select.getStatus()).toBe(PromiseStatus.initialised);

    select.rest();

    expect(select.getStatus()).toBe(PromiseStatus.rest);

    const pr_addr1 = channel.read();
    const pr1 = new PromiseT(pr_addr1, memory);

    pr1.act();

    expect(select.getStatus()).toBe(PromiseStatus.resolved);

    expect(memory.getInt32(memory.getDataAddr(pr1.getData()))).toBe(memory.getInt32(memory.getDataAddr(data)));
  });
});
