import { MemoryRegion } from './memory_region';

const FREELIST = 0;

export class Heap extends MemoryRegion {
  public constructor(fixed_region: number, allocated_region: number) {
    if (fixed_region % 4 !== 0) {
      throw new Error('The fixed region for heap must be a multiple of 4.');
    }
    if (fixed_region < 4) {
      throw new Error('The fixed region for heap must be at least 4 bytes.');
    }
    if (allocated_region < 8) {
      throw new Error('The allocation region for heap must be at least 8 bytes.');
    }
    if (allocated_region % 4 !== 0) {
      throw new Error('The allocation region for heap must be a multiple of 4.');
    }
    super(fixed_region + allocated_region);

    // Freelist
    this.setInt32(FREELIST, fixed_region);
    this.setInt32(fixed_region, allocated_region);
    this.setInt32(fixed_region + 4, -1);
  }

  public allocate(sizeInBytes: number): number {
    if (sizeInBytes <= 0) {
      throw new Error('The size must be greater than zero.');
    }

    const alignedSize = Math.ceil(sizeInBytes / 4) * 4 + 4;
    let currentBlock = 0;

    while (this.getInt32(currentBlock) !== -1) {
      const addr = this.getInt32(currentBlock);
      const blockSize = this.getInt32(addr);
      const nextBlock = this.getInt32(addr + 4);

      if (blockSize >= alignedSize) {
        const remainingBlockSize = blockSize - alignedSize;

        if (remainingBlockSize >= 8) {
          this.setUint32(addr, alignedSize);
          this.setUint32(addr + alignedSize, remainingBlockSize);
          this.setInt32(addr + alignedSize + 4, nextBlock);
          this.setInt32(currentBlock, addr + alignedSize);
        } else {
          this.setInt32(currentBlock, nextBlock);
        }

        // Zeros the memory
        for (let i = addr + 4; i < addr + alignedSize; i += 4) {
          this.setInt32(i, 0);
        }
        return addr + 4;
      }
      currentBlock = addr + 4;
    }

    throw new Error('Out of memory');
  }

  public free(addr: number): void {
    addr -= 4;
    let prevBlock = 0;
    let next = this.getInt32(prevBlock);

    while (next < addr && next !== -1) {
      prevBlock = next + 4;
      next = this.getInt32(prevBlock);
    }

    if (prevBlock != 0 && this.getInt32(prevBlock - 4) + prevBlock - 4 === addr) {
      this.setUint32(prevBlock - 4, this.getUint32(prevBlock - 4) + this.getUint32(addr));
      addr = prevBlock - 4;
    } else {
      this.setInt32(prevBlock, addr);
    }

    if (addr + this.getInt32(addr) === next) {
      this.setUint32(addr, this.getUint32(addr) + this.getUint32(next));
      this.setInt32(addr + 4, this.getInt32(next + 4));
    } else {
      this.setInt32(addr + 4, next);
    }
  }
}
