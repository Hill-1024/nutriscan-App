import { readFileSync, writeFileSync, existsSync } from 'fs';

// Read package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = pkg.version;

console.log(`\n📦 Syncing App Version to Native: ${version}`);

// Calculate Integer Version Code (Standard approach: Major * 10000 + Minor * 100 + Patch)
// e.g. 2.0.2 -> 20002
const parts = version.split('.').map(v => parseInt(v, 10));
const major = parts[0] || 0;
const minor = parts[1] || 0;
const patch = parts[2] || 0;

const versionCode = major * 10000 + minor * 100 + patch;

// --- ANDROID ---
const gradlePath = './android/app/build.gradle';
if (existsSync(gradlePath)) {
    let gradle = readFileSync(gradlePath, 'utf-8');
    let changed = false;

    // 1. Sync versionName
    // Matches: versionName followed by space, optional equals, space, quote (single or double), content, same quote
    const nameRegex = /(versionName\s*=?\s*)(["'])([^"']*)\2/;

    if (nameRegex.test(gradle)) {
        const match = gradle.match(nameRegex);
        const currentName = match[3]; // The content inside quotes
        const quoteType = match[2];   // The quote used (' or ")

        if (currentName !== version) {
            gradle = gradle.replace(nameRegex, `$1${quoteType}${version}${quoteType}`);
            console.log(`   ✏️  Android versionName: "${currentName}" -> "${version}"`);
            changed = true;
        } else {
            console.log(`   ✓  Android versionName is already "${version}"`);
        }
    } else {
        console.log(`   ⚠️  Could not find "versionName" in build.gradle`);
    }

    // 2. Sync versionCode
    // Matches: versionCode followed by space, optional equals, space, digits
    const codeRegex = /(versionCode\s*=?\s*)(\d+)/;

    if (codeRegex.test(gradle)) {
        const match = gradle.match(codeRegex);
        const currentCode = parseInt(match[2]);

        if (currentCode !== versionCode) {
            gradle = gradle.replace(codeRegex, `$1${versionCode}`);
            console.log(`   ✏️  Android versionCode: ${currentCode} -> ${versionCode}`);
            changed = true;
        } else {
            console.log(`   ✓  Android versionCode is already ${versionCode}`);
        }
    } else {
        console.log(`   ⚠️  Could not find "versionCode" in build.gradle`);
    }

    if (changed) {
        writeFileSync(gradlePath, gradle);
        console.log('   ✅ Android build.gradle updated successfully.');
    }
} else {
    console.log('   ⚠️ Android project not detected at ./android/app/build.gradle. (Run "npx cap add android" first?)');
}

console.log('\n');