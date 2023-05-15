const sql = require("mysql");
const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "home_auto_sys"
});

module.exports = db;