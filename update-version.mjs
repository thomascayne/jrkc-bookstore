// update-version.mjs

import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Get the release type from command line argument, default to 'patch'
const releaseType = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(releaseType)) {
    console.error('Invalid release type. Use "major", "minor", or "patch".');
    process.exit(1);
}

const currentVersion = packageJson.version;
const newVersion = semver.inc(currentVersion, releaseType);

if (newVersion) {
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated version to ${newVersion}`);
} else {
    console.error('Failed to increment version');
    process.exit(1);
}
