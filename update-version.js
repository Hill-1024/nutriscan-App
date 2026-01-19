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

// --- ANDROID BUILD GRADLE ---
const gradlePath = './android/app/build.gradle';
if (existsSync(gradlePath)) {
    let gradle = readFileSync(gradlePath, 'utf-8');
    let changed = false;

    // 1. Sync versionName
    const nameRegex = /(versionName\s*=?\s*)(["'])([^"']*)\2/;
    if (nameRegex.test(gradle)) {
        const match = gradle.match(nameRegex);
        const currentName = match[3];
        const quoteType = match[2];

        if (currentName !== version) {
            gradle = gradle.replace(nameRegex, `$1${quoteType}${version}${quoteType}`);
            console.log(`   ✏️  Android versionName: "${currentName}" -> "${version}"`);
            changed = true;
        } else {
            console.log(`   ✓  Android versionName is already "${version}"`);
        }
    }

    // 2. Sync versionCode
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
    }

    if (changed) {
        writeFileSync(gradlePath, gradle);
        console.log('   ✅ Android build.gradle updated successfully.');
    }
}

// --- ANDROID MANIFEST PERMISSIONS CHECK ---
const manifestPath = './android/app/src/main/AndroidManifest.xml';
if (existsSync(manifestPath)) {
    let manifest = readFileSync(manifestPath, 'utf-8');
    let manifestChanged = false;

    // Check for Camera Permission
    if (!manifest.includes('android.permission.CAMERA')) {
        console.log('   ➕ Injecting CAMERA permission into AndroidManifest.xml');
        // Insert before </manifest> end tag, but ideally inside <manifest> before <application>
        // Simple heuristic: insert before <application
        if (manifest.includes('<application')) {
            manifest = manifest.replace('<application', '<uses-permission android:name="android.permission.CAMERA" />\n    <application');
            manifestChanged = true;
        }
    }

    // Check for Hardware Feature (Optional but good practice)
    if (!manifest.includes('android.hardware.camera')) {
        console.log('   ➕ Injecting hardware.camera feature into AndroidManifest.xml');
        if (manifest.includes('<application')) {
            manifest = manifest.replace('<application', '<uses-feature android:name="android.hardware.camera" />\n    <application');
            manifestChanged = true;
        }
    }

    if (manifestChanged) {
        writeFileSync(manifestPath, manifest);
        console.log('   ✅ AndroidManifest.xml permissions updated.');
    } else {
        console.log('   ✓  AndroidManifest.xml already has Camera permissions.');
    }
} else {
    console.log('   ⚠️ AndroidManifest.xml not found at standard path.');
}

console.log('\n');