import { compile } from '../compiler/compiler';
import { parse } from '../parser/parser';

export const run = async (code: string): Promise<string> => {
  return await new Promise((resolve: (value: string) => void, reject: (reason?: any) => void) => {
    try {
      const ast = parse(code);
      const instructions = compile(ast);
      // TODO: run
      resolve(
        instructions
          .map((i) => {
            const { type, ...others } = i;
            return type + (Object.keys(others).length ? ' ' + JSON.stringify(others) : '');
          })
          .join('\n')
      );
    } catch (err) {
      reject(err);
    }
  });
};
