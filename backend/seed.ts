import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/travel-match";

// Bộ dữ liệu mẫu cho Tour
const sampleTours = [
  {
    title: "Vịnh Hạ Long: Du Thuyền 5 Sao Paradise Cruise",
    slug: "ha-long",
    description: "Trải nghiệm đẳng cấp trên vịnh di sản với du thuyền 5 sao Paradise Cruise. Tận hưởng bữa tối lãng mạn giữa lòng vịnh, chèo thuyền Kayak khám phá Hang Luồn và ngắm bình minh trên boong tàu. Dịch vụ chuyên nghiệp, phòng nghỉ sang trọng với ban công riêng hướng biển.",
    price: 4950000,
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
    slug: "sapa",
    description: "Hành trình khám phá thị trấn sương mù Sapa đầy thơ mộng. Trải nghiệm hệ thống cáp treo hiện đại nhất thế giới để chinh phục đỉnh Fansipan cao 3.143m. Thăm bản Cát Cát của người Mông và thưởng thức đặc sản lẩu cá tầm giữa cái lạnh Tây Bắc.",
    price: 3650000,
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
  }
];

// Bộ dữ liệu mẫu cho Địa điểm (Destinations)
const sampleDestinations = [
  {
    name: "Thừa Thiên Huế",
    slug: "hue",
    toursCount: "50+ Tours",
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Đà Nẵng",
    slug: "da-nang",
    toursCount: "100+ Tours",
    img: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Hà Giang",
    slug: "ha-giang",
    toursCount: "30+ Tours",
    img: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80",
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
    const destinationsCollection = db.collection('destinations');
    const activitiesCollection = db.collection('activities');

    console.log('--- Đang dọn dẹp dữ liệu cũ... ---');
    await toursCollection.deleteMany({});
    await destinationsCollection.deleteMany({});
    await activitiesCollection.deleteMany({});

    // Seed Tours
    console.log('--- Đang seed dữ liệu Tour... ---');
    await toursCollection.insertMany(sampleTours);

    // Seed Destinations
    console.log('--- Đang seed dữ liệu Địa điểm... ---');
    const destResult = await destinationsCollection.insertMany(sampleDestinations);
    console.log(`--- Đã seed ${destResult.insertedCount} địa điểm. ---`);

    // Lấy ID của các địa điểm vừa tạo để gán cho hoạt động
    const hueId = destResult.insertedIds[0];
    const danangId = destResult.insertedIds[1];
    const hagiangId = destResult.insertedIds[2];

    // Bộ dữ liệu mẫu cho Hoạt động (Activities)
    const sampleActivities = [
      // Thừa Thiên Huế
      {
        destinationId: hueId,
        name: "Ăn sáng: Bún Bò Bà Thủy",
        address: "120 Nguyễn Huệ, Huế",
        price: 50000,
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
        durationHours: 1.5,
        category: "Morning",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        destinationId: hueId,
        name: "Tham quan Đại Nội Huế",
        address: "Thuận Thành, Huế",
        price: 200000,
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
        durationHours: 3,
        category: "Morning",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Đà Nẵng
      {
        destinationId: danangId,
        name: "Ăn sáng: Mì Quảng Bà Mua",
        address: "19 Trần Bình Trọng, Đà Nẵng",
        price: 45000,
        image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80",
        durationHours: 1,
        category: "Morning",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        destinationId: danangId,
        name: "Leo núi Ngũ Hành Sơn",
        address: "Hòa Hải, Ngũ Hành Sơn",
        price: 40000,
        image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80",
        durationHours: 3,
        category: "Morning",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('--- Đang seed dữ liệu Hoạt động... ---');
    const actResult = await activitiesCollection.insertMany(sampleActivities);
    console.log(`--- Đã seed ${actResult.insertedCount} hoạt động. ---`);

    console.log('--- HOÀN TẤT SEED DỮ LIỆU! ---');

  } catch (error) {
    console.error('!!! Lỗi trong quá trình SEED: !!!', error);
  } finally {
    await client.close();
  }
}

seed();
