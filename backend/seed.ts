import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/travel-match";

// Bộ dữ liệu mẫu với thông tin tour chi tiết và giá tiền đơn vị VNĐ
const sampleTours = [
  {
    title: "Vịnh Hạ Long: Du Thuyền 5 Sao Paradise Cruise",
    description: "Trải nghiệm đẳng cấp trên vịnh di sản với du thuyền 5 sao Paradise Cruise. Tận hưởng bữa tối lãng mạn giữa lòng vịnh, chèo thuyền Kayak khám phá Hang Luồn và ngắm bình minh trên boong tàu. Dịch vụ chuyên nghiệp, phòng nghỉ sang trọng với ban công riêng hướng biển.",
    price: 4950000, // Giá VNĐ cho 2 ngày 1 đêm
    location: "Quảng Ninh",
    slots: 15,
    duration: "2 Ngày 1 Đêm",
    images: [
      "https://images.unsplash.com/photo-1559592442-7e18259f63eb?q=80&w=1200",
      "https://images.unsplash.com/photo-1599708137356-9ef0f3984144?q=80&w=1200"
    ],
    itinerary: [
      "Ngày 1: Hà Nội - Cảng Tuần Châu - Lên tàu - Thăm Hang Luồn & Kayak.",
      "Ngày 2: Hang Sửng Sốt - Đỉnh Titop - Bữa sáng buffet - Về lại cảng."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-06-15", "2024-07-01"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Sapa: Chinh Phục Đỉnh Fansipan - Nóc Nhà Đông Dương",
    description: "Hành trình khám phá thị trấn sương mù Sapa đầy thơ mộng. Trải nghiệm hệ thống cáp treo hiện đại nhất thế giới để chinh phục đỉnh Fansipan cao 3.143m. Thăm bản Cát Cát của người Mông và thưởng thức đặc sản lẩu cá tầm giữa cái lạnh Tây Bắc.",
    price: 3650000, // Giá VNĐ
    location: "Lào Cai",
    slots: 12,
    duration: "3 Ngày 2 Đêm",
    images: [
      "https://images.unsplash.com/photo-1504457047772-27fad17438ef?q=80&w=1200",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200"
    ],
    itinerary: [
      "Ngày 1: Đón tại Lào Cai/Sapa - Thăm bản Cát Cát - Thưởng thức ẩm thực dân tộc.",
      "Ngày 2: Trekking qua thung lũng Mường Hoa - Chinh phục đỉnh Fansipan.",
      "Ngày 3: Khám phá núi Hàm Rồng - Chợ Sapa - Tiễn đoàn."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-06-20", "2024-08-10"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Phú Quốc: Nghỉ Dưỡng Tại Đảo Ngọc Grand World",
    description: "Tận hưởng kỳ nghỉ thiên đường tại đảo ngọc Phú Quốc. Khám phá thành phố không ngủ Grand World, vui chơi tại VinWonders & Safari. Lặn ngắm san hô tại quần đảo An Thới và thưởng thức hải sản tươi sống tại chợ đêm Dinh Cậu.",
    price: 6850000, // Giá VNĐ
    location: "Kiên Giang",
    slots: 20,
    duration: "4 Ngày 3 Đêm",
    images: [
      "https://images.unsplash.com/photo-1589782182703-2aad67281b51?q=80&w=1200",
      "https://images.unsplash.com/photo-1570940428522-864765662719?q=80&w=1200"
    ],
    itinerary: [
      "Ngày 1: Đón sân bay Phú Quốc - Check-in Resort - Ngắm hoàng hôn tại Sunset Sanato.",
      "Ngày 2: Tham quan 4 đảo bằng Cano - Lặn ngắm san hô tại Hòn Thơm.",
      "Ngày 3: Khám phá VinWonders & Safari - Show diễn Tinh hoa Việt Nam.",
      "Ngày 4: Thăm nhà tù Phú Quốc - Cơ sở nước mắm - Tiễn sân bay."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-07-05", "2024-09-12"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Đà Nẵng - Hội An: Khám Phá Cầu Vàng Bà Nà Hills",
    description: "Hành trình kết nối những di sản miền Trung. Check-in Cầu Vàng nổi tiếng thế giới tại Bà Nà Hills, dạo bước phố cổ Hội An lung linh dưới ánh đèn lồng. Thưởng thức đặc sản mì Quảng, cao lầu và tắm biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh.",
    price: 3250000, // Giá VNĐ
    location: "Đà Nẵng",
    slots: 25,
    duration: "3 Ngày 2 Đêm",
    images: [
      "https://images.unsplash.com/photo-1555581938-2301101374c6?q=80&w=1200",
      "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=1200"
    ],
    itinerary: [
      "Ngày 1: Đón sân bay Đà Nẵng - Bán đảo Sơn Trà - Ngũ Hành Sơn - Phố cổ Hội An.",
      "Ngày 2: Chinh phục Bà Nà Hills - Cầu Vàng - Vui chơi tại Fantasy Park.",
      "Ngày 3: Tự do tắm biển Mỹ Khê - Mua sắm tại Chợ Hàn - Tiễn sân bay."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-06-25", "2024-10-20"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ninh Bình: Tuyệt Tình Cốc & Quần Thể Di Sản Tràng An",
    description: "Ngồi thuyền xuôi dòng Tràng An, chiêm ngưỡng phim trường Kong: Skull Island và kiến trúc cổ kính của cố đô Hoa Lư. Leo núi Múa ngắm trọn cảnh đẹp Tam Cốc từ trên cao. Một hành trình quay về quá khứ đầy ý nghĩa.",
    price: 1850000, // Giá VNĐ
    location: "Ninh Bình",
    slots: 30,
    duration: "1 Ngày",
    images: [
      "https://images.unsplash.com/photo-1591539676705-ad0427ec6523?q=80&w=1200",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200"
    ],
    itinerary: [
      "Sáng: Hà Nội - Cố đô Hoa Lư - Thăm đền thờ Vua Đinh, Vua Lê.",
      "Trưa: Ăn trưa buffet đặc sản cơm cháy, thịt dê Ninh Bình.",
      "Chiều: Thuyền Tràng An - Hang Múa - Trở về Hà Nội."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-05-30", "2024-06-12"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Hà Giang: Chinh Phục Mã Pí Lèng & Sông Nho Quế",
    description: "Hành trình dành cho những tâm hồn ưa mạo hiểm. Chinh phục một trong tứ đại đỉnh đèo - Mã Pí Lèng, thăm Cột cờ Lũng Cú - điểm cực Bắc của Tổ quốc. Trải nghiệm đi thuyền trên sông Nho Quế xanh ngắt và ngủ bản tìm hiểu văn hóa vùng cao.",
    price: 4200000, // Giá VNĐ
    location: "Hà Giang",
    slots: 10,
    duration: "3 Ngày 2 Đêm",
    images: [
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200",
      "https://images.unsplash.com/photo-1605440172859-0ca61c338f30?q=80&w=1200"
    ],
    itinerary: [
      "Ngày 1: Hà Nội - Hà Giang - Quản Bạ - Rừng thông Yên Minh.",
      "Ngày 2: Phố Cáo - Đồng Văn - Cột cờ Lũng Cú - Mã Pí Lèng - Sông Nho Quế.",
      "Ngày 3: Chợ phiên Đồng Văn - Dinh họ Vương - Hà Nội."
    ],
    status: "approved",
    ownerId: new ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    dates: ["2024-09-01", "2024-11-15"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    console.log('--- Đang kết nối tới cơ sở dữ liệu MongoDB... ---');
    await client.connect();
    console.log('--- Kết nối thành công! ---');

    const db = client.db();
    const toursCollection = db.collection('tours');

    console.log('--- Đang dọn dẹp các tour cũ để cập nhật bộ data VNĐ mới... ---');
    await toursCollection.deleteMany({});

    console.log(`--- Đang thực hiện bơm ${sampleTours.length} tour "siêu phẩm" với giá VNĐ vào hệ thống... ---`);
    const result = await toursCollection.insertMany(sampleTours);
    
    console.log(`--- HOÀN TẤT! Đã cập nhật ${result.insertedCount} tour mới lung linh. ---`);
    console.log('--- Bây giờ hãy F5 ứng dụng để tận hưởng bộ dữ liệu mới nhé! ---');

  } catch (error) {
    console.error('!!! Lỗi trong quá trình SEED: !!!', error);
  } finally {
    await client.close();
  }
}

seed();
