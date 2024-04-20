import fs from 'fs';
import { run } from '../runner';

const SOURCE_FILES_DIR = 'src/runner/__tests__/sourceFiles/';

describe('Runner tests', () => {
  fs.readdirSync(SOURCE_FILES_DIR).forEach((file) => {
    const source = fs.readFileSync(SOURCE_FILES_DIR + file, { encoding: 'utf8' });
    it('runs ' + file + ' correctly', async () => {
      const s = await run(source);
      expect(s).toMatchSnapshot();
    });
  });
});
