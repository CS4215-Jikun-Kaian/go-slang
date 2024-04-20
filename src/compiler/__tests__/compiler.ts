import fs from 'fs';
import { parse } from '../../parser/parser';
import { compile } from '../compiler';

const SOURCE_FILES_DIR = 'src/compiler/__tests__/sourceFiles/';

describe('Compiler tests', () => {
  fs.readdirSync(SOURCE_FILES_DIR).forEach((file) => {
    const source = fs.readFileSync(SOURCE_FILES_DIR + file, { encoding: 'utf8' });
    it('compiles ' + file + ' correctly', () => {
      const AST = parse(source);
      const instructions = compile(AST);
      expect(instructions).toMatchSnapshot();
    });
  });
});
