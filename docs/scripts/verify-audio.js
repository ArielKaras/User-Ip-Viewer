const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verifying Audio Documentation Setup...');

// 1. Check if Dependencies are installed
try {
    require.resolve('openai');
    require.resolve('@aws-sdk/client-s3');
    console.log('✅ Dependencies: Installed');
} catch (e) {
    console.error('❌ Dependencies: Missing. Run "npm install" in docs folder.');
    process.exit(1);
}

// 2. Check if Scripts exist
if (fs.existsSync('docs/scripts/generate-audio.js')) {
    console.log('✅ Script: generate-audio.js exists');
} else {
    console.error('❌ Script: generate-audio.js MISSING');
    process.exit(1);
}

// 3. Run Dry Run
console.log('\n🏃 Running Dry Run (No API calls)...');
try {
    execSync('node docs/scripts/generate-audio.js --dry-run', { stdio: 'inherit' });
    console.log('\n✅ Verification Passed: Audio generation logic is valid.');
} catch (e) {
    console.error('\n❌ Verification Failed: Script error during dry run.');
    process.exit(1);
}
