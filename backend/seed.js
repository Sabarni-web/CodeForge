import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/codeforge').then(async () => {
  const User = (await import('./src/models/User.js')).default;
  
  const newUsers = [
    {
      username: 'Sabarni345',
      email: 'sabarni345@example.com',
      password: 'password123',
      displayName: 'Sabarni 345',
      bio: 'Another test user!'
    },
    {
      username: 'JohnDoe',
      email: 'john@example.com',
      password: 'password123',
      displayName: 'John Doe',
      bio: 'Full stack developer'
    },
    {
      username: 'JaneSmith',
      email: 'jane@example.com',
      password: 'password123',
      displayName: 'Jane Smith',
      bio: 'UI/UX Designer'
    }
  ];

  for (const userData of newUsers) {
    const exists = await User.findOne({ username: userData.username });
    if (!exists) {
      await User.create(userData);
      console.log(`Created test user ${userData.username}`);
    } else {
      console.log(`User ${userData.username} already exists`);
    }
  }
  
  mongoose.connection.close();
});
