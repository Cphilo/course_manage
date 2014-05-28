var express = require('express');
var util = require('util');
var router = express.Router();
var mysql = require('mysql');
var settings = require('./../settings');
var conn = mysql.createConnection(settings.mysqlConfig);
conn.connect();

var render_stu = function(username, res) {
    conn.query("select * from course", function(err, courses){ 
        if(err) throw err;
        var sql = util.format("select * from record, class, course where sname='%s' and record.clsno=class.clsno and course.cno=class.cno", username);
        conn.query(sql, function(err, records) {
            if(err)throw err;
            //console.log(records);
            //console.log(records.length);
            res.render("student", { 
                username: username, 
                courses: courses, 
                records: records 
            });
        });
    });
};

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '课程管理系统', message: false });
});
    
router.post('/login', function(req, res) {
    var username = req.param("username");
    var pwd = req.param("password");
    var sql = util.format("select * from user where name='%s' and password='%s' ", username, pwd);
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length) {
            if(rows[0].role == "s") {
                render_stu(username, res);
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
router.post("/:user/addRecord", function(req, res) {
    var user = req.param("user");
    var cno = parseInt(req.param("cno"));
    var clsno = parseInt(req.param("clsno"));
    var sql = util.format("insert into record values('%s', %d, 0)", user, clsno);
    conn.query(sql, function(err, rows) {
        if(err)throw err;
        render_stu(user, res);
    });
});


router.get("/:courseNo/getClasses", function(req, res) {
    var cno = parseInt(req.param("courseNo"));
    var sql = util.format("select * from class where cno=%d", cno);
    conn.query(sql, function(err, rows) {
        if(err)throw err;
        res.send(rows);
    });
});

router.get("/:classNo/getTa", function(req, res) {
    var classNo = parseInt(req.param("classNo"));
    var sql = util.format("select tname as name from class where clsno=%d", classNo);
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        res.send(rows);
    });
});

module.exports = router;
