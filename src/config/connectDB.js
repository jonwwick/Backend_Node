// File: ./config/connectDB.js
import { Sequelize } from 'sequelize'; // Sử dụng import
import fs from 'fs';
import path from 'path';

// Đọc biến môi trường (đã được nạp bởi server.js)
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbCaPath = process.env.DB_SSL_CA_PATH || '../Nodejs/src/certs/ca.pem'; // Lấy đường dẫn CA từ .env hoặc dùng mặc định

// --- Kiểm tra sự tồn tại của file CA ---
const resolvedCaPath = path.resolve(dbCaPath); // Lấy đường dẫn tuyệt đối/chuẩn hóa
if (!fs.existsSync(resolvedCaPath)) {
    console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`!!! LỖI: Không tìm thấy file chứng chỉ SSL CA tại: ${resolvedCaPath}`);
    console.error(`!!! Vui lòng tải file ca.pem từ Aiven Console và đặt vào đường dẫn trên.`);
    console.error(`!!! Hoặc cập nhật biến DB_SSL_CA_PATH trong file .env nếu bạn đặt ở nơi khác.`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
    process.exit(1); // Thoát ứng dụng vì không thể kết nối DB nếu thiếu CA cert
}
// --- Kết thúc kiểm tra file CA ---

// Khởi tạo instance Sequelize với cấu hình cho Aiven
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort, // Thêm port vào đây
    dialect: 'mysql',
    logging: false, // Đặt thành console.log nếu muốn xem các câu lệnh SQL được Sequelize tạo ra
    dialectOptions: {
        // Cấu hình SSL bắt buộc cho Aiven
        ssl: {
            require: true, // Bắt buộc sử dụng SSL
            ca: fs.readFileSync(resolvedCaPath) // Đọc nội dung file CA
            // rejectUnauthorized: true // Mặc định là true khi có 'ca', đảm bảo chứng chỉ hợp lệ.
                                      // Chỉ đặt thành false khi thử nghiệm và gặp lỗi verify, nhưng rất không khuyến khích cho production.
        }
    },
    pool: { // Cấu hình connection pool (tùy chọn, Sequelize có mặc định khá tốt)
       max: 5,  // Số kết nối tối đa
       min: 0,   // Số kết nối tối thiểu
       acquire: 30000, // Thời gian tối đa (ms) để cố gắng lấy kết nối trước khi báo lỗi
       idle: 10000     // Thời gian tối đa (ms) một kết nối có thể nhàn rỗi trước khi bị giải phóng
     }
});

// Hàm connectDB để kiểm tra kết nối ban đầu (được gọi từ server.js)
const connectDB = async () => {
    try {
        await sequelize.authenticate(); // Sử dụng instance sequelize đã cấu hình ở trên
        console.log(`=> Sequelize connected successfully to Aiven database: ${dbName} on host ${dbHost}`);
    } catch (error) {
        console.error(`\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
        console.error(`!!! LỖI Sequelize: Không thể kết nối tới database Aiven (${dbName})`);
        console.error(`!!! Kiểm tra lại thông tin trong file .env (Host, Port, User, Password, DB Name).`);
        console.error(`!!! Đảm bảo đường dẫn DB_SSL_CA_PATH (${resolvedCaPath}) chính xác và file ca.pem hợp lệ.`);
        console.error(`!!! Kiểm tra kết nối mạng và cài đặt firewall (nếu có).`);
        console.error(`!!! Chi tiết lỗi: ${error.message}`); // In lỗi cụ thể
        console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n`);
        // Cân nhắc việc thoát ứng dụng nếu kết nối ban đầu thất bại
        // process.exit(1);
    }
};

// QUAN TRỌNG: Export instance 'sequelize' để các file model có thể sử dụng
export { sequelize };

// Export hàm connectDB (default) để server.js gọi
export default connectDB;