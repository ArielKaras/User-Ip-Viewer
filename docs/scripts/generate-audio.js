const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { glob } = require('glob');
const matter = require('gray-matter');
const removeMd = require('remove-markdown');
require('dotenv').config();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || (DRY_RUN ? 'dry-run-bucket' : undefined);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || (DRY_RUN ? 'dry-run-key' : undefined);
const REGION = process.env.AWS_REGION || 'us-east-1';

if (!BUCKET_NAME || !OPENAI_API_KEY) {
    console.error('Error: AWS_BUCKET_NAME and OPENAI_API_KEY must be set in environment variables.');
    process.exit(1);
}

const s3 = new S3Client({ region: REGION });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function fileExistsInS3(key) {
    if (DRY_RUN) return false;
    try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        return true;
    } catch (error) {
        if (error.name === 'NotFound') return false;
        throw error;
    }
}

async function uploadToS3(key, buffer, contentType) {
    if (DRY_RUN) {
        console.log(`[DRY RUN] Would upload to s3://${BUCKET_NAME}/${key} (${buffer.length} bytes)`);
        return;
    }
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));
    console.log(`Uploaded: s3://${BUCKET_NAME}/${key}`);
}

function cleanText(markdown) {
    // Top-level clean
    let text = removeMd(markdown);

    // Remove "Download Source File" lines and other artifacts using regex
    text = text.replace(/Download Source File/g, '');
    text = text.replace(/Step \d: .*/g, '');
    text = text.replace(/Audio Deep Dive/g, '');

    // Collapse whitespace
    return text.replace(/\s+/g, ' ').trim();
}

async function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: markdownBody } = matter(content);

    const filename = path.basename(filePath, '.md');
    // Using simple slug for key
    const s3Key = `audio/${filename}.mp3`;

    const exists = await fileExistsInS3(s3Key);
    if (exists) {
        console.log(`Skipping (Exists): ${filename}`);
        return;
    }

    console.log(`Generating Audio: ${filename}...`);

    // 2. Prepare Text
    const plainText = cleanText(markdownBody);
    if (plainText.length < 50) {
        console.log(`Skipping (Too short): ${filename}`);
        return;
    }

    // 3. Generate Audio
    try {
        let buffer;
        if (DRY_RUN) {
            console.log(`[DRY RUN] Would call OpenAI TTS for "${filename}" (${plainText.length} chars)`);
            buffer = Buffer.from('dry-run-audio-content');
        } else {
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: plainText.substring(0, 4096), // Limit to 4096 chars for now to avoid errors
            });
            buffer = Buffer.from(await mp3.arrayBuffer());
        }

        // 4. Upload
        await uploadToS3(s3Key, buffer, 'audio/mpeg');
    } catch (error) {
        console.error(`Failed to process ${filename}:`, error);
        if (!DRY_RUN) process.exit(1);
    }
}

async function main() {
    // Find all documentation markdown files
    const files = await glob('docs/wiki/**/*.md');
    console.log(`Found ${files.length} files.`);

    for (const file of files) {
        await processFile(file);
    }
}

main().catch(console.error);
