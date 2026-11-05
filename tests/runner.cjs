const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function createExpect(actual) {
  const matchers = {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected deep equal ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      if (diff > Math.pow(10, -precision) / 2) {
        throw new Error(`Expected ${actual} to be close to ${expected}`);
      }
    },
    toHaveLength(expected) {
      if (!actual || actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual ? actual.length : actual}`);
      }
    },
  };

  matchers.not = {
    toBe(expected) {
      if (actual === expected) {
        throw new Error(`Expected not ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        throw new Error(`Expected not equal ${JSON.stringify(expected)}`);
      }
    },
  };

  return matchers;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

global.describe = (suiteName, fn) => {
  console.log(`\n\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
  fn();
};

global.it = (testName, fn) => {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔ ${testName}\x1b[0m`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✘ ${testName}\x1b[0m`);
    console.error(`    ${err.message}`);
  }
};

global.expect = createExpect;

const unitDir = path.join(__dirname, 'unit');
const files = fs.readdirSync(unitDir).filter((f) => f.endsWith('.test.ts'));

for (const file of files) {
  const filePath = path.join(unitDir, file);
  const tsCode = fs.readFileSync(filePath, 'utf8');
  const jsCode = ts.transpile(tsCode, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  });

  const customRequire = (mod) => {
    if (mod === 'vitest') {
      return { describe: global.describe, it: global.it, expect: global.expect };
    }
    if (mod.includes('spatialMath')) {
      const spPath = path.resolve(__dirname, '../apps/web/src/maps/spatialMath.ts');
      const spTs = fs.readFileSync(spPath, 'utf8');
      const spJs = ts.transpile(spTs, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS });
      const spM = { exports: {} };
      const spWrap = new Function('require', 'exports', 'module', spJs);
      spWrap(require, spM.exports, spM);
      return spM.exports;
    }
    return require(mod);
  };

  const m = { exports: {} };
  const wrapper = new Function('require', 'exports', 'module', '__filename', '__dirname', jsCode);
  try {
    wrapper(customRequire, m.exports, m, filePath, path.dirname(filePath));
  } catch (err) {
    console.error(`Error loading ${file}:`, err);
  }
}

console.log(`\n--------------------------------------------------`);
console.log(`Total tests: ${totalTests} | Passed: \x1b[32m${passedTests}\x1b[0m | Failed: ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : '0'}`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log(`\x1b[32m✔ TODAS LAS PRUEBAS UNITARIAS PASARON EXITOSAMENTE (100% PASS)\x1b[0m\n`);
}
