var express = require('express');
var util = require('util');
var router = express.Router();
var mysql = require('mysql');
var settings = require('./../settings');
var conn = mysql.createConnection(settings.mysqlConfig);
conn.connect();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '课程管理系统', message: false });
});
    
router.post('/login', function(req, res) {
    var username = req.param("username");
    var pwd = req.param("password");
    var sql = util.format("select * from user where name='%s' and password='%s' ", username, pwd);
    conn.query(sql, function(err, rows) {
        console.log("rows"+rows);
        if(err) throw err;
        if(rows.length) {
            if(rows[0].role == "s") {
                conn.query("select * from course", function(err, rows){ 
                    if(err) throw err;
                    else {
                        res.render("student", { username: username, courses: rows });
                    }
                });
            } else {
                var sql = util.format("select * from class where tname='%s' ", username);
                conn.query(sql, function(err, rows) {
                    if(err)throw err;
                    else {        
                        res.render("teacher", { username: username, classes: rows });
                    }
                });
            }
        } else {
            res.render("index", {message: "*请重新输入用户名和密码", title: '课程管理系统'});  
        }  
    });
});

//Here need set session when user login.
//Or the simulated add course post request can attack this website.
//Now I just try to make things simple.
router.post("/:user/add_course", function(req, res) {
    
});

module.exports = router;
