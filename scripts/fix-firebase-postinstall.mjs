import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

try {
  const utilPkg = require.resolve('@firebase/util/package.json');
  const distDir = join(dirname(utilPkg), 'dist');
  const contents = "export const getDefaultsFromPostinstall = () => undefined;\n";
  const targets = [
    join(distDir, 'postinstall.mjs'),
    join(distDir, 'node-esm', 'postinstall.mjs'),
  ];

  for (const target of targets) {
    const dir = dirname(target);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(target)) {
      writeFileSync(target, contents);
      console.log(`Created ${target}`);
    }
  }
} catch (error) {
  console.warn('fix firebase postinstall skipped:', error.message);
}
