import { Heap } from './heap';

export class Arena extends Heap {
  private readonly sizeInBytes: number;
  private readonly allocatedList = 4;

  public constructor(fixed_region: number, sizeInBytes: number) {
    if (fixed_region < 8) {
      throw new Error('The fixed region for arena must be at least 8 bytes.');
    }
    super(fixed_region, sizeInBytes);
    this.sizeInBytes = sizeInBytes;
    this.setInt32(this.allocatedList, -1);
  }

  public allocateNode(numberOfChildren: number, sizeOfData: number): number {
    const size = 4 + 4 * numberOfChildren + sizeOfData;
    const addr = this.allocate(size);
    const newNode = this.allocate(8);
    if (addr === -1 || newNode === -1) {
      if (newNode !== -1) {
        this.free(newNode);
      }
      if (addr !== -1) {
        this.free(addr);
      }
      return -1;
    }
    this.setInt32(addr, numberOfChildren);
    for (let i = 0; i < numberOfChildren; i++) {
      this.setInt32(addr + 4 + 4 * i, -1);
    }
    this.setInt32(newNode, addr);
    this.setInt32(newNode + 4, this.getInt32(4));
    this.setInt32(4, newNode);
    return addr;
  }

  public setChild(addr: number, index: number, child: number): void {
    this.setInt32(addr + 4 + 4 * index, child);
  }

  public getChild(addr: number, index: number): number {
    return this.getInt32(addr + 4 + 4 * index);
  }

  public getChildAddr(addr: number, index: number): number {
    return addr + 4 + 4 * index;
  }

  public getNumberofChildren(addr: number): number {
    return this.getUint32(addr) & 0x7fffffff;
  }

  public getDataAddr(addr: number): number {
    return addr + 4 + 4 * this.getUint32(addr);
  }

  public mark(addr: number): void {
    const numberOfChildren = this.getNumberofChildren(addr);
    this.setUint32(addr, numberOfChildren | 0x80000000);
    for (let i = 0; i < numberOfChildren; i++) {
      const child = this.getChild(addr, i);
      if (child !== -1) {
        this.mark(child);
      }
    }
  }

  public sweep(): void {
    let prev = this.allocatedList;
    while (this.getInt32(prev) !== -1) {
      const node = this.getInt32(prev);
      if (this.getUint32(this.getInt32(node)) & 0x80000000) {
        this.setInt32(this.getInt32(node), this.getUint32(this.getInt32(node)) & 0x7fffffff);
        prev = node + 4;
      } else {
        const nextNode = this.getInt32(node + 4);
        this.free(this.getInt32(node));
        this.free(node);
        this.setInt32(prev, nextNode);
      }
    }
  }
}
