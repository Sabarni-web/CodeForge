import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import RepositoryDNA from './src/models/RepositoryDNA.js';
import Repository from './src/models/Repository.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const repos = await Repository.find();
  console.log(`Total repos: ${repos.length}`);
  const dnas = await RepositoryDNA.find();
  console.log(`Total DNAs: ${dnas.length}`);
  process.exit(0);
}
check();
