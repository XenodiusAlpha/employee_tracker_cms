const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ground20Break23!",
    database: "employees_db"
});

connection.connect(function(error){
    if (error) {
        throw error;
    }
})

module.exports = connection;