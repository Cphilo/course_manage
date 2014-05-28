drop database db_hw;
create database db_hw;
use db_hw;
create table user (
    name varchar(20),
    password varchar(50),
    role varchar(10),
    primary key (name)
);
create table course (
    cno int,
    cname varchar(30),
    cdesc varchar(200),
    primary key (cno)
);
create table class (
    clsno int,
    cno int,
    tname varchar(20),
    smax int,
    foreign key (cno) references course(cno),
    foreign key (tname) references user(name),
    primary key (clsno) 
);
create table record (
    sname varchar(20),
    clsno int,
    grade float,
    foreign key (sname) references user(name),
    foreign key (clsno) references class(clsno),
    primary key (sname, clsno)
);
insert into user values ("cll", "123", "s"), ("xmy", "123", "t"),
    ("pzd", "123", "s"), ("xlp", "123", "t"), ("chz", "123", "s"),
    ("qjy", "123", "s"), ("lkf", "123", "t"), ("lk", "123", "t");
insert into course values (1, "C语言程序设计", "..."), (2, "离散数学", "..."), (3, "数据结构", "..."), (4, "算法设计", "..."), (5, "计算机组成原理", "..."), (6, "操作系统", "..."), (7, "计算机网络", "..."), (8, "数据库原理", "..."), (9, "编译原理", "...");
insert into class values (1, 1, "lkf", 10), (2, 1, "lk", 30), (3, 8, "xmy", 30), (4, 8, "lkf", 30), (5, 8, "xmy", 30), (6, 9, "xlp", 30), (7, 9, "xlp", 30);
