import { readFileSync, writeFileSync, existsSync } from 'fs';

// Read package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const rawVersion = pkg.version;

console.log(`\n📦 Syncing App Version to Native: ${rawVersion}`);

// 1. Calculate Integer Version Code
// Formula: Major * 10000 + Minor * 100 + Patch
// Example: 2.1.5 -> 20105
// This ensures strict increasing integers for Android updates.

// Remove any semver suffixes (e.g., "2.0.2-beta.1" -> "2.0.2")
const versionBase = rawVersion.split('-')[0];
const parts = versionBase.split('.').map(v => parseInt(v, 10));

const major = parts[0] || 0;
const minor = parts[1] || 0;
const patch = parts[2] || 0;

// Enforce safe limits if necessary, but standard semver fits well here
const versionCode = major * 10000 + minor * 100 + patch;

console.log(`   🧮 Calculated Android versionCode: ${versionCode} (from ${major}.${minor}.${patch})`);

// --- ANDROID BUILD GRADLE ---
const gradlePath = './android/app/build.gradle';
if (existsSync(gradlePath)) {
  let gradle = readFileSync(gradlePath, 'utf-8');
  let changed = false;

  // 2. Sync versionName (The visible string, e.g., "2.0.2")
  const nameRegex = /(versionName\s*=?\s*)(["'])([^"']*)\2/;
  if (nameRegex.test(gradle)) {
     const match = gradle.match(nameRegex);
     const currentName = match[3];
     const quoteType = match[2];

     if (currentName !== rawVersion) {
       gradle = gradle.replace(nameRegex, `$1${quoteType}${rawVersion}${quoteType}`);
       console.log(`   ✏️  Android versionName: "${currentName}" -> "${rawVersion}"`);
       changed = true;
     } else {
       console.log(`   ✓  Android versionName is already "${rawVersion}"`);
     }
  }

  // 3. Sync versionCode (The integer for update checks)
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
        // Insert before <application> tag
        if (manifest.includes('<application')) {
            manifest = manifest.replace('<application', '<uses-permission android:name="android.permission.CAMERA" />\n    <application');
            manifestChanged = true;
        }
    }

    // Check for Hardware Feature (Required for store filtering and robust checking)
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
    // Note: Don't error out if folder doesn't exist (e.g. running before 'cap add android')
    console.log('   ℹ️  AndroidManifest.xml not found (Android platform may not be added yet).');
}

console.log('\n');