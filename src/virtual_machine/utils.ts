import { Arena } from "../memory/arena"

export const push = (array: any[], ...items: any[]) => {
  for (let item of items) {
      array.push(item)
  }
  return array 
}

export const peek = (array: any[], address: number) =>
    array.slice(-1 - address)[0]

export const word_to_string = (word: number) => {
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setFloat64(0, word);
    let binStr = '';
    for (let i = 0; i < 8; i++) {
        binStr += ('00000000' + 
                   view.getUint8(i).toString(2)).slice(-8) + 
                   ' ';
    }
    return binStr
}


export const heap_get_tag = (memory: Arena, address: number) => memory.getInt8(address);