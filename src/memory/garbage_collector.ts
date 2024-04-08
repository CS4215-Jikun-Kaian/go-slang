import { Heap } from './heap';

export class GarbageCollectedHeap extends Heap {

  private readonly sizeInBytes: number;
  private allocatedList: number;

  public constructor(sizeInBytes: number) {
    super(sizeInBytes);
    this.sizeInBytes = sizeInBytes;
    this.allocatedList = this.allocate(4);
  }

  public allocateNode(sizeOfData: number, numberOfChildren: number): number {
    const size = 4 + 4 * numberOfChildren + sizeOfData;
    const addr = this.allocate(size);
    if (addr === -1) {
      return -1;
    }
    this.setInt32(addr, numberOfChildren);
    for (let i = 0; i < numberOfChildren; i++) {
      this.setInt32(addr + 4 + 4 * i, -1);
    }
    const newNode = this.allocate(8);
    this.setInt32(newNode, addr);
    this.setInt32(newNode + 4, this.getInt32(this.allocatedList));
    this.setInt32(this.allocatedList, newNode);
    return addr;
  }

  public getChild(addr: number, index: number): number {
    return this.getInt32(addr + 4 + 4 * index);
  }

  public getNumberofChildren(addr: number): number {
    return Math.abs(this.getInt32(addr));
  }

  public getData(addr: number): number {
    return addr + 4 + 4 * this.getUint32(addr);
  }

  public mark(addr: number) {
    const numberOfChildren = this.getNumberofChildren(addr);
    this.setInt32(addr, -numberOfChildren);
    for (let i = 0; i < numberOfChildren; i++) {
      const child = this.getChild(addr, i);
      if (child !== -1) {
        this.mark(child);
      }
    }
  }

  public sweep() {
    // TODO
  }
}