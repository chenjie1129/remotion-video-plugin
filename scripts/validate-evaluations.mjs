import {readFile} from 'node:fs/promises';

const file = new URL('../evaluations/cases.json', import.meta.url);
const suite = JSON.parse(await readFile(file, 'utf8'));

const fail = (message) => {
  throw new Error(`evaluation contract: ${message}`);
};

if (suite.version !== 1) fail('version must be 1');
if (!Array.isArray(suite.cases) || suite.cases.length < 10) fail('at least ten cases are required');

for (const [name, value] of Object.entries(suite.thresholds ?? {})) {
  if (typeof value !== 'number' || value < 0 || value > 1) fail(`threshold ${name} must be between 0 and 1`);
}

const ids = new Set();
for (const [index, testCase] of suite.cases.entries()) {
  if (typeof testCase.id !== 'string' || !/^[a-z0-9-]+$/.test(testCase.id)) fail(`case ${index} has an invalid id`);
  if (ids.has(testCase.id)) fail(`duplicate case id ${testCase.id}`);
  ids.add(testCase.id);
  if (typeof testCase.prompt !== 'string' || testCase.prompt.trim().length < 30) fail(`${testCase.id} needs a concrete prompt`);
  if (!Array.isArray(testCase.requirements) || testCase.requirements.length < 3) fail(`${testCase.id} needs at least three requirements`);
  if (!Array.isArray(testCase.stillFrames) || testCase.stillFrames.length === 0 || testCase.stillFrames.some((frame) => !Number.isInteger(frame) || frame < 0)) {
    fail(`${testCase.id} needs non-negative integer still frames`);
  }
  const expected = testCase.expected;
  if (!expected || !Number.isInteger(expected.width) || !Number.isInteger(expected.height) || !Number.isInteger(expected.fps)) {
    fail(`${testCase.id} needs integer dimensions and fps`);
  }
  if (!(expected.minimumDurationSeconds > 0) || expected.maximumDurationSeconds < expected.minimumDurationSeconds) {
    fail(`${testCase.id} has an invalid duration range`);
  }
  if (!['required', 'optional', 'absent'].includes(expected.audio)) fail(`${testCase.id} has an invalid audio expectation`);
}

console.log(`Validated ${suite.cases.length} model-to-render evaluation cases.`);
