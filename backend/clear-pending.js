const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // Xóa các hồ sơ đang ở trạng thái pending
  const result = await db.collection('partnerapplications').deleteMany({ status: 'pending' });
  console.log('Đã xóa', result.deletedCount, 'hồ sơ đang chờ duyệt.');
  
  await mongoose.disconnect();
}

run().catch(console.dir);
