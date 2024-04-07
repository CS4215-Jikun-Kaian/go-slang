import { MemoryRegion } from './memory_region';

export class Heap {

  private readonly heap: MemoryRegion;
  private readonly sizeInBytes: number;

  public constructor(sizeInBytes: number) {
    if (sizeInBytes < 12) {
      throw new Error('The heap size must be at least 12 bytes.');
    }
    if (sizeInBytes % 4 !== 0) {
      throw new Error('The heap size must be a multiple of 4.');
    }

    this.heap = new MemoryRegion(sizeInBytes);
    this.sizeInBytes = sizeInBytes;

    // Freelist
    this.heap.setInt32(0, 4);
    this.heap.setInt32(4, sizeInBytes - 4);
    this.heap.setInt32(8, -1);
  }

  public allocate(sizeInBytes: number): number {

    if (sizeInBytes <= 0) {
      throw new Error('The size must be greater than zero.');
    }

    const alignedSize = Math.ceil(sizeInBytes / 4) * 4 + 4;
    let currentBlock = 0;

    while (this.heap.getInt32(currentBlock) !== -1) {
      const addr = this.heap.getInt32(currentBlock);
      const blockSize = this.heap.getInt32(addr);
      const nextBlock = this.heap.getInt32(addr + 4);

      if (blockSize >= alignedSize) {
        const remainingBlockSize = blockSize - alignedSize;

        if (remainingBlockSize >= 8) {
          this.heap.setUint32(addr, alignedSize);
          this.heap.setUint32(addr + alignedSize, remainingBlockSize);
          this.heap.setInt32(addr + alignedSize + 4, nextBlock);
          this.heap.setInt32(currentBlock, addr + alignedSize);
        } else {
          this.heap.setInt32(currentBlock, nextBlock);
        }

        // Zeros the memory
        for (let i = addr + 4; i < addr + alignedSize; i += 4) {
          this.heap.setInt32(i, 0);
        }
        return addr + 4;
      }
      currentBlock = addr + 4;
    }

    return -1;
  }

  public free(addr: number): void {
    addr -= 4;
    let prevBlock = 0;
    let next = this.heap.getInt32(prevBlock);

    while (next < addr && next !== -1) {
      prevBlock = next+4;
      next = this.heap.getInt32(prevBlock);
    }


    if (prevBlock != 0 && this.heap.getInt32(prevBlock - 4) + prevBlock - 4 === addr) {
      this.heap.setUint32(prevBlock - 4, this.heap.getUint32(prevBlock-4) + this.heap.getUint32(addr));
      addr = prevBlock - 4;
    } else {
      this.heap.setInt32(prevBlock, addr);
    }

    if (addr + this.heap.getInt32(addr) === next) {
      this.heap.setUint32(addr, this.heap.getUint32(addr) + this.heap.getUint32(next));
      this.heap.setInt32(addr + 4, this.heap.getInt32(next + 4));
    } else {
      this.heap.setInt32(addr + 4, next);
    }

  }

  public debug(): void {
    for (let i = 0; i < this.sizeInBytes; i += 4) {
      console.log(`${i}: ${this.heap.getInt32(i)}`);
    }
  }
}