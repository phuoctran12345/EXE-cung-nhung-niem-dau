const mongoose = require('mongoose');

async function run() {
  const uri = 'mongodb+srv://phuocthde180577_db_user:Phuoc12345@cluster0.ruhl6tb.mongodb.net/EXE?appName=Cluster0';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // Xóa các hồ sơ đang ở trạng thái pending
  const result = await db.collection('partnerapplications').deleteMany({ status: 'pending' });
  console.log('Đã xóa', result.deletedCount, 'hồ sơ đang chờ duyệt.');
  
  await mongoose.disconnect();
}

run().catch(console.dir);
