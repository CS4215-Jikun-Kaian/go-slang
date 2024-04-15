import { parse } from '../parser';
import fs from 'fs';

const SOURCE_FILES_DIR = 'src/parser/__tests__/sourceFiles/';

describe('Parser tests', () => {
  fs.readdirSync(SOURCE_FILES_DIR).forEach((file) => {
    const source = fs.readFileSync(SOURCE_FILES_DIR + file, { encoding: 'utf8' });
    it('parses ' + file + ' correctly', () => {
      const AST = parse(source);
      expect(AST).toMatchSnapshot();
    });
  });
});
