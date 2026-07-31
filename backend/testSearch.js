const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/codeforge').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('Users in DB:', users.map(u => u.username));
  const q = 'SabarniABC';
  const lenientQ = q.trim().replace(/[\s_]+/g, '.*');
  const searchUsers = await db.collection('users').find({ username: { $regex: lenientQ, $options: 'i' } }).toArray();
  console.log('Search result for SabarniABC:', searchUsers.map(u => u.username));
  mongoose.connection.close();
});
