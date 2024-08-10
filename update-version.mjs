import fs from 'fs';
import path from 'path';
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
console.log('Current version:', currentVersion);

function incrementVersion(version, releaseType) {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (releaseType) {
        case 'major':
            return `${major + 1}.0.00`;
        case 'minor':
            return `${major}.${minor + 1}.00`;
        case 'patch':
            const newPatch = (patch + 1).toString().padStart(2, '0');
            return `${major}.${minor}.${newPatch}`;
        default:
            throw new Error('Invalid release type');
    }
}

try {
    const newVersion = incrementVersion(currentVersion, releaseType);
    console.log('New version:', newVersion);

    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated version to ${newVersion}`);
} catch (error) {
    console.error('Error updating version:', error.message);
    process.exit(1);
}