import { readFileSync, writeFileSync } from 'fs';

const dir = 'lib/content';

const fixes = [
  { file: 'jasadi-content.ts', from: 'JASADI_CONTENT_CONTENT', to: 'JASADI_CONTENT' },
  { file: 'nafsi-content.ts',  from: 'NAFSI_CONTENT_CONTENT',  to: 'NAFSI_CONTENT'  },
  { file: 'fikri-content.ts',  from: 'FIKRI_CONTENT_CONTENT',  to: 'FIKRI_CONTENT'  },
  { file: 'ruhi-content.ts',   from: 'RUHI_CONTENT_CONTENT',   to: 'RUHI_CONTENT'   },
];

// Fix export names in domain files
for (const { file, from, to } of fixes) {
  const path = `${dir}/${file}`;
  const content = readFileSync(path, 'utf8');
  const count = (content.match(new RegExp(from, 'g')) || []).length;
  const fixed = content.replaceAll(from, to);
  writeFileSync(path, fixed, 'utf8');
  console.log(`Fixed: ${file}  (${count} occurrences: ${from} → ${to})`);
}

// Fix index.ts
const idxPath = `${dir}/index.ts`;
let idx = readFileSync(idxPath, 'utf8');
idx = idx
  .replaceAll('JASADI_CONTENT_CONTENT', 'JASADI_CONTENT')
  .replaceAll('NAFSI_CONTENT_CONTENT',  'NAFSI_CONTENT')
  .replaceAll('FIKRI_CONTENT_CONTENT',  'FIKRI_CONTENT')
  .replaceAll('RUHI_CONTENT_CONTENT',   'RUHI_CONTENT');
writeFileSync(idxPath, idx, 'utf8');
console.log('Fixed: index.ts');

// Count tool entries per domain
console.log('\n📊 Entry counts:');
for (const { file } of fixes) {
  const path = `${dir}/${file}`;
  const content = readFileSync(path, 'utf8');
  const matches = content.match(/type: '(protocol|practice|test|workshop|tracker)'/g) || [];
  const domain = file.replace('-content.ts', '').padEnd(10);
  console.log(`  ${domain} → ${matches.length} entries`);
}

console.log('\n✅ Done');
