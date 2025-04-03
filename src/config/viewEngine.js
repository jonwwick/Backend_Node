import express from"express";

let configViewEngine = (app) =>{
    //arow function
    app.use(express.static("./src/public"))
    app.set("view engine", "ejs"); // dùng vòng lặp (tác dụng view engine)
    app.set("views","./src/views"); // set đường link lấy view engine
}

module.exports = configViewEngine;