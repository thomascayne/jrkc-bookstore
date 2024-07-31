// version.mjs
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { execSync } from 'child_process';

function getGitHash() {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        return 'unknown';
    }
}

function getPackageVersion() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const { version } = JSON.parse(packageJsonContent);
    return version;
}

function generateVersion() {
    const packageVersion = getPackageVersion();
    const gitHash = getGitHash();

    // Increment patch version
    const incrementedVersion = semver.inc(packageVersion, 'patch');

    // Append git hash
    return incrementedVersion ? `${incrementedVersion}-${gitHash}` : `0.1.0-${gitHash}`;
}

export const version = generateVersion();

