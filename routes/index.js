var express = require('express');
var util = require('util');
var router = express.Router();
var mysql = require('mysql');
var settings = require('./../settings');
var conn = mysql.createConnection(settings.mysqlConfig);
conn.connect();

var checkAuth = function(req, res, next) {
    if(!req.session.user_id) {
        res.redirect('/login');
    } else {
        next();
    }
};

var render_stu = function(username, res, message) {
    var message = (typeof message==="undefined")?false:message;
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
                records: records, 
                message: message
            });
        });
    });
};
var render_ta = function(username, res) { 
    var sql = util.format("select * from class, course where tname='%s' and class.cno=course.cno", username);
    conn.query(sql, function(err, rows) {
        if(err)throw err;
        else {        
            res.render("teacher", { username: username, classes: rows });
        }
    });
};

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '课程管理系统', message: false });
});
router.get('/login', function(req, res) {
    res.render('index', { title: '课程管理系统', message: false });
});
router.get('/logout', function(req, res) {
    delete req.session.user_id;
    res.redirect('/login');
});
    
router.post('/profile', function(req, res) {
    var username = req.param("username");
    var pwd = req.param("password");
    var sql = util.format("select * from user where name='%s' and password='%s' ", username, pwd);
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length) {
            req.session.user_id = username;
            if(rows[0].role == "s") {
                render_stu(username, res);
            } else {
                render_ta(username, res);
            }
        } else {
            res.render("index", {message: "*请重新输入用户名和密码", title: '课程管理系统'});  
        }  
    });
});

//Here need set session when user login.
//Or the simulated add record post request can attack this website.
//Now I just try to make things simple.
router.post("/:user/addRecord", checkAuth, function(req, res) {
    var user = req.param("user");
    var cno = parseInt(req.param("cno"));
    var clsno = parseInt(req.param("clsno"));
    var sql = util.format("insert into record values('%s', %d, 0)", user, clsno);
    conn.query(sql, function(err, rows) {
        if(err) {
            //throw err;
            render_stu(user, res, "*请选择课程名和课堂名, 同一个课堂不能重复选择");
        } else {
            render_stu(user, res);
        }
    });
});

//Same attack like the above add record request.
//Need set user login session.
router.get("/:clsno/addGrade", checkAuth, function(req, res) {
    var clsno = parseInt(req.param("clsno"));
    var sql = util.format("select * from record where clsno=%d", clsno);
    var cls_sql = util.format("select * from class, course where clsno=%d and class.cno=course.cno", clsno);
    conn.query(sql, function(err, records) {
        if(err) throw err;
        conn.query(cls_sql, function(err, clss) {
            if(err) throw err;
            res.render("addGrade", {
                records: records,
                cls: clss[0]
            });
        });         
    });
});

var handle_mul_update = function(cnt, l, res, clsno) {
    if(cnt == l) {
        var sql = util.format("select * from class where clsno=%d", clsno);
        conn.query(sql, function(err, rows) {
            if(err) throw err;
            render_ta(rows[0].tname, res);
        });     
    }
    
};

router.post("/:clsno/commitGrade", checkAuth, function(req, res) {
    var clsno = parseInt(req.param("clsno"));
    var snames = req.param("sname");
    var grades = req.param("grade");
    console.log(grades);
    var usql = '';
    var cnt = 0;
    for(var i=0;i<snames.length;i++) {
        usql = util.format("update record set grade=%d where clsno=%d and sname='%s'", parseFloat(grades[i]), clsno, snames[i]);
        conn.query(usql, function(err, rows) {
            if(err)throw err;
            cnt += 1;
            handle_mul_update(cnt, snames.length, res, clsno);
        });
    }
});


router.get("/:courseNo/getClasses", function(req, res) {
    var cno = parseInt(req.param("courseNo"));
    var sql = util.format("select * from class where cno=%d", cno);
    conn.query(sql, function(err, rows) {
        //if(err)throw err;
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
