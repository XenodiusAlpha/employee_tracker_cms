const mysql = require("mysql2");
const pass = require("../pass");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: `${pass}`,
    database: "employees_db"
});

connection.connect(function(error){
    if (error) {
        throw error;
    }
})

module.exports = connection;