var secret = require('./secret');
var mysqlConfig = {
    host: 'localhost',
    user: secret.mysqlUser,
    password: secret.mysqlPwd,
    database: "db_hw",
    port: 3306
};
exports.mysqlConfig = mysqlConfig;
