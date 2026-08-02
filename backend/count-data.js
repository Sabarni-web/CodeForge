import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import File from './src/models/File.js';
import Commit from './src/models/Commit.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const missingBranchFiles = await File.countDocuments({ branch: { $exists: false } });
    console.log('Files missing branch:', missingBranchFiles);

    const mainBranchFiles = await File.countDocuments({ branch: 'main' });
    console.log('Files on main branch:', mainBranchFiles);

    const missingBranchCommits = await Commit.countDocuments({ branch: { $exists: false } });
    console.log('Commits missing branch:', missingBranchCommits);

    console.log('File Indexes:');
    console.log(await File.collection.indexes());

    await File.collection.dropIndex('path_1_repository_1');
    console.log('Dropped old index');

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

run();
