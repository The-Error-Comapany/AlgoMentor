const mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ac-uaqlpbb-shard-00-00.fji7lhz.mongodb.net:27017,ac-uaqlpbb-shard-00-01.fji7lhz.mongodb.net:27017,ac-uaqlpbb-shard-00-02.fji7lhz.mongodb.net:27017/test?replicaSet=atlas-m9y225-shard-0&authSource=admin&ssl=true').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ lcHandle: { $exists: true, $ne: '' } });
  console.log('User with LC:', user);
  
  if (user) {
    const res = await fetch('http://localhost:3000/api/sync/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id.toString(), lcHandle: user.lcHandle, cfHandle: user.cfHandle })
    });
    console.log('Sync Response:', await res.json());
  }
  
  mongoose.disconnect();
});
