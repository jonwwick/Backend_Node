// File: ./config/connectDB.js
// Phiên bản sử dụng Cách 1: Lưu nội dung CA cert vào biến môi trường DB_SSL_CA_CONTENT

import { Sequelize } from 'sequelize';
// Không cần 'fs' hay 'path' để đọc file CA nữa

// --- Đọc biến môi trường ---
// Đảm bảo các biến này được đặt trong Environment Variables trên Render
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
// Lấy nội dung CA trực tiếp từ biến môi trường mới
const dbCaContent = process.env.DB_SSL_CA_CONTENT;

// --- Kiểm tra biến môi trường CA ---
// Rất quan trọng: Phải có nội dung CA để kết nối SSL tới Aiven
if (!dbCaContent || dbCaContent.trim() === '') {
    // Ghi lỗi ra console một cách rõ ràng
    console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`!!! LỖI CẤU HÌNH NGHIÊM TRỌNG: Biến môi trường DB_SSL_CA_CONTENT chưa được đặt hoặc bị trống.`);
    console.error(`!!! -> Cách sửa trên Render:`);
    console.error(`!!!    1. Vào Service Node.js -> Environment -> Environment Variables.`);
    console.error(`!!!    2. Nhấn "Add Environment Variable", chọn Type là "Secret".`);
    console.error(`!!!    3. Đặt Key là: DB_SSL_CA_CONTENT`);
    console.error(`!!!    4. Dán TOÀN BỘ nội dung file ca.pem (từ -----BEGIN... đến ...END CERTIFICATE-----) vào ô Value.`);
    console.error(`!!!    5. Nhấn "Save Changes" và trigger deploy lại nếu cần.`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
    // Dừng ứng dụng ngay lập tức vì không thể kết nối DB nếu thiếu cấu hình SSL
    process.exit(1);
}
// --- Kết thúc kiểm tra ---

// --- Khởi tạo instance Sequelize ---
let sequelize; // Khai báo ở ngoài để export
try {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort, // Đảm bảo DB_PORT được cung cấp
      dialect: 'mysql',
      logging: false, // Đặt thành console.log để xem SQL queries khi cần debug trên Render
      dialectOptions: {
          // Cấu hình SSL bắt buộc cho Aiven
          ssl: {
              require: true, // Bắt buộc sử dụng SSL
              // Sử dụng trực tiếp nội dung CA từ biến môi trường
              ca: dbCaContent
              // rejectUnauthorized: true // Mặc định là true khi 'ca' được cung cấp. Giữ nguyên để bảo mật.
          }
      },
      pool: { // Cấu hình connection pool
         max: 5,      // Số kết nối tối đa Render thường giới hạn plan miễn phí/rẻ
         min: 0,      // Số kết nối tối thiểu
         acquire: 30000, // Timeout khi lấy connection (ms)
         idle: 10000    // Timeout connection nhàn rỗi (ms)
       },
      // Nên đặt timezone để đảm bảo tính nhất quán về thời gian
      timezone: '+07:00' // Ví dụ: giờ Việt Nam
  });
  console.log("Sequelize instance configured successfully."); // Thêm log khởi tạo thành công
} catch (error) {
    // Bắt lỗi ngay tại lúc khởi tạo Sequelize nếu có vấn đề nghiêm trọng
    // Ví dụ: Thiếu biến môi trường cơ bản (DB_HOST, DB_USER...), lỗi thư viện nội bộ
     console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
     console.error(`!!! LỖI KHỞI TẠO SEQUELIZE: Không thể tạo instance Sequelize.`);
     console.error(`!!! -> Kiểm tra kỹ các biến môi trường DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME đã được đặt trên Render chưa.`);
     console.error(`!!! Chi tiết lỗi: ${error.message}`);
     console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
     process.exit(1); // Dừng ứng dụng nếu không khởi tạo được Sequelize
}
// --- Kết thúc Khởi tạo instance Sequelize ---


// --- Hàm kiểm tra kết nối ban đầu ---
// Hàm này được gọi từ server.js để đảm bảo kết nối hoạt động lúc khởi động
const connectDB = async () => {
    // Kiểm tra lại sequelize instance phòng trường hợp lỗi không mong muốn
    if (!sequelize) {
         console.error("!!! LỖI connectDB: Sequelize instance không tồn tại. Không thể kiểm tra kết nối.");
         return; // Thoát hàm kiểm tra
    }
    try {
        await sequelize.authenticate(); // Thử kết nối và xác thực
        console.log(`=> OK! Sequelize ĐÃ KẾT NỐI thành công tới database Aiven: "${dbName}" (Host: ${dbHost})`);
    } catch (error) {
        // Log lỗi kết nối chi tiết để dễ debug trên Render Logs
        console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
        console.error(`!!! LỖI KẾT NỐI SEQUELIZE: Không thể authenticate tới database Aiven (${dbName})`);
        console.error(`!!! -> KIỂM TRA LẠI CÁC YẾU TỐ SAU:`);
        console.error(`!!!    1. Giá trị các biến môi trường trên Render: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.`);
        console.error(`!!!    2. Nội dung biến môi trường DB_SSL_CA_CONTENT có đúng là toàn bộ nội dung file ca.pem không?`);
        console.error(`!!!    3. Firewall trên Aiven Console (service MySQL -> Firewall) đã cho phép IP của Render chưa? (Thường không cần nếu Render dùng IP động, nhưng nên kiểm tra).`);
        console.error(`!!!    4. Trạng thái dịch vụ database trên Aiven Console có đang "Running" không?`);
        console.error(`!!! Chi tiết lỗi Sequelize: ${error.name}`);
        // In lỗi gốc nếu có (thường chứa thông tin cụ thể hơn về lỗi mạng, access denied, v.v.)
        if (error.original) {
             console.error(`!!! Lỗi gốc (Original Error): ${error.original}`); // Quan trọng để biết lý do Access Denied, Timeout,...
        } else {
             console.error(`!!! Chi tiết lỗi đầy đủ: ${error}`);
        }
        console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
        // Không nên process.exit(1) ở đây để server có thể vẫn chạy và thử lại hoặc báo lỗi API
    }
};
// --- Kết thúc Hàm kiểm tra kết nối ban đầu ---

// QUAN TRỌNG: Export instance 'sequelize' đã được cấu hình
// Các file models sẽ import instance này để định nghĩa model.
export { sequelize };

// Export hàm connectDB (dưới dạng default)
// server.js sẽ import và gọi hàm này lúc khởi động để kiểm tra kết nối.
export default connectDB;