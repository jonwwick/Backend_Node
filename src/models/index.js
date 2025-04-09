// models/index.js (ĐÃ SỬA ĐỔI)
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize'); // Vẫn cần Sequelize constructor cho DataTypes

// --- BỎ PHẦN ĐỌC config.json VÀ TẠO SEQUELIZE MỚI ---
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development'; // Không cần nữa
// const config = require(__dirname + '/../config/config.json')[env]; // Không cần nữa
// let sequelize; // Sẽ import từ connectDB
// if (config.use_env_variable) { ... } else { ... } // Bỏ hết khối này

// --- IMPORT INSTANCE SEQUELIZE ĐÃ CẤU HÌNH ---
// Đảm bảo đường dẫn import là chính xác từ models/index.js đến config/connectDB.js
const { sequelize } = require('../config/connectDB');
// ----------------------------------------------

const basename = path.basename(__filename); // Giữ lại basename
const db = {};

// --- Phần đọc và load model giữ nguyên, nhưng dùng 'sequelize' đã import ---
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 // Thêm điều kiện loại trừ file test nếu có
    );
  })
  .forEach(file => {
    // Quan trọng: Truyền instance 'sequelize' đã import vào
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// --- Phần associations giữ nguyên ---
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// --- Gắn instance sequelize đã import vào db object ---
db.sequelize = sequelize;
// Bạn có thể không cần export Sequelize constructor nếu các file model dùng import
// db.Sequelize = Sequelize;

module.exports = db;