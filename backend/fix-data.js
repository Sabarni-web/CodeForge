import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import File from './src/models/File.js';
import Commit from './src/models/Commit.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.abc.mongodb.net/codeforge?retryWrites=true&w=majority');
    console.log('Connected to DB');

    const fileResult = await File.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: 'main' } }
    );
    console.log(`Updated ${fileResult.modifiedCount} files`);

    const commitResult = await Commit.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: 'main' } }
    );
    console.log(`Updated ${commitResult.modifiedCount} commits`);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

run();
