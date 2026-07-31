import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/codeforge').then(async () => {
  const User = (await import('./src/models/User.js')).default;
  
  const testUser = await User.findOne({ username: 'SabarniABC' });
  if (!testUser) {
    await User.create({
      username: 'SabarniABC',
      email: 'sabarni@example.com',
      password: 'password123',
      displayName: 'Sabarni',
      bio: 'I am a test user created to test the search feature!'
    });
    console.log('Created test user SabarniABC');
  } else {
    console.log('User SabarniABC already exists');
  }
  mongoose.connection.close();
});
