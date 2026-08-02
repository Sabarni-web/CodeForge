import mongoose from 'mongoose';
import User from './src/models/User.js';
import Repository from './src/models/Repository.js';
import { forkRepository } from './src/controllers/forkController.js';
import { canForkRepository } from './src/middleware/canForkRepository.js';
import './src/models/File.js';
import './src/models/Commit.js';
import './src/models/ForkRelationship.js';
import './src/models/Notification.js';

mongoose.connect('mongodb://127.0.0.1:27017/codeforge').then(async () => {
  try {
    const user = await User.findOne({ username: 'Urmi_Paul' });
    const parentRepo = await Repository.findOne({ owner: user._id }); // get their own repo
    
    if (!parentRepo) {
      console.log('No repo to fork found');
      process.exit(1);
    }
    console.log('Forking', parentRepo.name, 'as', user.username);
    
    await Repository.deleteMany({ owner: user._id, isFork: true });
    
    // Mock req and res
    const req = {
      user: { id: user._id, _id: user._id, username: user.username },
      params: { id: parentRepo._id }
    };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('Response:', this.statusCode, data);
      }
    };
    
    // Call middleware then controller
    await canForkRepository(req, res, async () => {
      await forkRepository(req, res);
    });
    
  } catch(e) {
    console.error('Fork error:', e);
  } finally {
    // allow some time for async operations to complete logging
    setTimeout(() => mongoose.disconnect(), 1000);
  }
});
