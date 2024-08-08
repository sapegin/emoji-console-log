/* eslint-disable unicorn/prefer-module */

import path from 'node:path';
import Mocha from 'mocha';
import { globSync } from 'glob';

export function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(10_000);

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((_resolve, reject) => {
    const files = globSync('**/**.test.js', { cwd: testsRoot });

    // Add files to the test suite
    for (const f of files) {
      mocha.addFile(path.resolve(testsRoot, f));
    }

    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          process.exit();
        }
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
