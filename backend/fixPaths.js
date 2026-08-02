import mongoose from 'mongoose';
import dotenv from 'dotenv';
import File from './src/models/File.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const repoId = '6a6f4a92a8df73e9bbff9ca8';
  
  // 1. Find and delete the initial README.md
  await File.deleteOne({ repository: repoId, path: 'README.md' });
  
  // 2. Find all files starting with 'ecommerce/' and remove the prefix
  const files = await File.find({ repository: repoId });
  for (const f of files) {
    if (f.path.startsWith('ecommerce/')) {
      const newPath = f.path.substring('ecommerce/'.length);
      const newName = newPath.split('/').pop();
      await File.updateOne({ _id: f._id }, { $set: { path: newPath, name: newName } });
      console.log('Renamed: ' + f.path + ' -> ' + newPath);
    }
  }
  process.exit(0);
});
