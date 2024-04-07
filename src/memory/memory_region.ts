


export class MemoryRegion {

  private readonly dataView: DataView;
  private readonly size: number;

  public constructor(size: number) {
    const buffer = new ArrayBuffer(size);
    this.dataView = new DataView(buffer);
    this.size = size;
  }

  public setInt8(address: number, value: number): void {
    this.dataView.setInt8(address, value);
  }

  public getInt8(address: number): number {
    return this.dataView.getInt8(address);
  }

  public setUint8(address: number, value: number): void {
    this.dataView.setUint8(address, value);
  }

  public getUint8(address: number): number {
    return this.dataView.getUint8(address);
  }

  public setInt16(address: number, value: number): void {
    this.dataView.setInt16(address, value);
  }

  public getInt16(address: number): number {
    return this.dataView.getInt16(address);
  }

  public setUint16(address: number, value: number): void {
    this.dataView.setUint16(address, value);
  }

  public getUint16(address: number): number {
    return this.dataView.getUint16(address);
  }

  public setInt32(address: number, value: number): void {
    this.dataView.setInt32(address, value);
  }

  public getInt32(address: number): number {
    return this.dataView.getInt32(address);
  }

  public setUint32(address: number, value: number): void {
    this.dataView.setUint32(address, value);
  }

  public getUint32(address: number): number {
    return this.dataView.getUint32(address);
  }

  public setInt64(address: number): BigInt {
    return this.dataView.getBigInt64(address);
  }

  public getInt64(address: number): BigInt {
    return this.dataView.getBigInt64(address);
  }

  public setUint64(address: number): BigInt {
    return this.dataView.getBigUint64(address);
  }

  public getUint64(address: number): BigInt {
    return this.dataView.getBigUint64(address);
  }

  public setIntptr(address: number): number {
    return this.dataView.getUint32(address);
  }

  public getIntptr(address: number): number {
    return this.dataView.getUint32(address);
  }

  public setFloat32(address: number, value: number): void {
    this.dataView.setFloat32(address, value);
  }

  public getFloat32(address: number): number {
    return this.dataView.getFloat32(address);
  }

  public setFloat64(address: number, value: number): void {
    this.dataView.setFloat64(address, value);
  }

  public getFloat64(address: number): number {
    return this.dataView.getFloat64(address);
  }

}

