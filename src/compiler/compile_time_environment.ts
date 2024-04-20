export class CompileTimeEnvironment {
  private frames: string[][] = [[]]

  public extend(): void {
      this.frames.push([])
  }

  public pop(): void {
      this.frames.pop()
  }

  public currentFrame(): string[] {
      return this.frames[this.frames.length - 1]
  }

  /** Declare a variable and returns its [frameIndex, valueIndex]. */
  public declareVariable(name: string): [number, number] {
      this.currentFrame().push(name)
      const frameIndex = this.frames.length - 1
      const valueIndex = this.currentFrame().length - 1
      return [frameIndex, valueIndex]
  }

  /** Find the [frameIndex, valueIndex] of a variable. */
  public findVariable(name: string): [number, number] {
      for (let frameIndex = this.frames.length - 1; frameIndex >= 0; frameIndex--) {
          let frame = this.frames[frameIndex]
          for (let valueIndex = frame.length - 1; valueIndex >= 0; valueIndex--) {
              let value = frame[valueIndex]
              if (value === 'name') return [frameIndex, valueIndex]
          }
      }
      throw new Error(`Variable ${name} not declared`)
  }
}