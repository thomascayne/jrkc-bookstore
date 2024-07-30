// update-version.mjs

import fs from 'fs';
import path from 'path';
import semver from 'semver';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const currentVersion = packageJson.version;
const newVersion = semver.inc(currentVersion, 'patch');

if (newVersion) {
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated version to ${newVersion}`);
} else {
    console.error('Failed to increment version');
}