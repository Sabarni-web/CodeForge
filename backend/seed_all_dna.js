import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Repository from './src/models/Repository.js';
import File from './src/models/File.js';
import { processFileDNA, processRepositoryDNA } from './src/services/dnaService.js';

async function seedDna() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const repos = await Repository.find();
    console.log(`Found ${repos.length} repositories. Processing...`);

    for (const repo of repos) {
      console.log(`Processing repo: ${repo.name} (${repo._id})`);
      
      // Enable Guardian for everyone
      repo.guardianEnabled = true;
      await repo.save();

      const files = await File.find({ repository: repo._id });
      console.log(`  Found ${files.length} files. Generating FileDNA...`);
      
      for (const file of files) {
        await processFileDNA(file);
      }
      
      console.log(`  Generating RepositoryDNA...`);
      await processRepositoryDNA(repo._id);
      console.log(`  Done with ${repo.name}`);
    }

    console.log('All repositories successfully fingerprinted!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDna();
