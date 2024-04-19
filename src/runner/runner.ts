import { parse } from '../parser/parser';

export const run = async (code: string): Promise<number> => {
  return await new Promise((resolve: (value: number) => void, reject: (reason?: any) => void) => {
    try {
      const ast = parse(code);
      // compile
      // run
      resolve(0);
    } catch (err) {
      reject(err);
    }
  });
};
