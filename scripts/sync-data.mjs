// Clones/updates the read-only iOS reference repo and copies its data into src/data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const REPO_URL = 'https://github.com/jenslohmann/ShotokanKata';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const customRef = process.env.IOS_REF_DIR;
const REF = customRef ? path.resolve(ROOT, customRef) : path.join(ROOT, '.ios-reference');
const update = process.argv.includes('--update');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  try {
    execFileSync('git', args, { stdio: 'inherit', cwd: ROOT });
  } catch {
    fail(`Could not get ${REPO_URL} – check network access`);
  }
}

if (!customRef) {
  if (!fs.existsSync(REF)) {
    git(['clone', '--depth', '1', `${REPO_URL}.git`, '.ios-reference']);
  } else if (update) {
    git(['-C', '.ios-reference', 'pull', '--ff-only']);
  }
} else if (!fs.existsSync(REF)) {
  fail(`IOS_REF_DIR does not exist: ${REF}`);
}

const APP = path.join(REF, 'Shotokan Kata', 'Shotokan Kata');
const SRC = path.join(APP, 'Resources');
const DEST = path.join(ROOT, 'src', 'data');

fs.rmSync(path.join(DEST, 'kata'), { recursive: true, force: true });
fs.mkdirSync(path.join(DEST, 'kata'), { recursive: true });

const copied = [];
function copy(from, to) {
  fs.copyFileSync(from, to);
  copied.push(to);
}

copy(path.join(SRC, 'kata.json'), path.join(DEST, 'kata.json'));
copy(path.join(SRC, 'vocabulary.json'), path.join(DEST, 'vocabulary.json'));

const KATA_FILE = /^\d{2}_[a-z0-9_]+\.json$/;
const kataFiles = fs.readdirSync(path.join(SRC, 'kata')).filter((name) => KATA_FILE.test(name)).sort();
for (const name of kataFiles) {
  copy(path.join(SRC, 'kata', name), path.join(DEST, 'kata', name));
}

const parsed = new Map();
for (const file of copied) {
  try {
    parsed.set(file, JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (err) {
    fail(`Invalid JSON in ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

const config = parsed.get(path.join(DEST, 'kata.json'));
for (const entry of config.availableKata ?? []) {
  if (entry.enabled && !fs.existsSync(path.join(DEST, 'kata', `${entry.fileName}.json`))) {
    console.warn(`Warning: enabled kata "${entry.fileName}" has no data file`);
  }
}

const iconDir = path.join(ROOT, 'icon-source');
fs.mkdirSync(iconDir, { recursive: true });
fs.copyFileSync(
  path.join(APP, 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon Shotokan.jpg'),
  path.join(iconDir, 'app-icon.jpg'),
);

const commit = execFileSync('git', ['-C', REF, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const source = { repo: REPO_URL, commit, syncedAt: new Date().toISOString() };
fs.writeFileSync(path.join(DEST, 'source.json'), `${JSON.stringify(source, null, 2)}\n`);

const vocabulary = parsed.get(path.join(DEST, 'vocabulary.json'));
console.log(`Synced iOS data from commit ${commit}`);
console.log(`Kata files copied: ${kataFiles.length}`);
console.log(`Vocabulary terms: ${vocabulary.vocabularyTerms?.length ?? 0}`);
