import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../public/assets');

async function optimizeImages() {
    console.log(`Scanning ${ASSETS_DIR}...`);

    if (!fs.existsSync(ASSETS_DIR)) {
        console.error('Assets directory not found!');
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);
    let convertedCount = 0;

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const inputPath = path.join(ASSETS_DIR, file);
            const outputPath = path.join(ASSETS_DIR, path.basename(file, ext) + '.webp');

            try {
                // Skip if webp already exists and is newer? 
                // For now, simple overwrite/create
                if (fs.existsSync(outputPath)) {
                    // console.log(`Skipping ${file}, webp exists.`);
                    // continue; 
                }

                await sharp(inputPath)
                    .webp({ quality: 80 }) // 80 is a good balance
                    .toFile(outputPath);

                console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
                convertedCount++;

                // Optional: Remove original to verify usage? 
                // fs.unlinkSync(inputPath); 
            } catch (err) {
                console.error(`Error converting ${file}:`, err);
            }
        }
    }

    console.log(`Optimization complete. Converted ${convertedCount} images.`);
}

optimizeImages();
