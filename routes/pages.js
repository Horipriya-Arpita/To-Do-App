const express = require("express");
const router = express.Router();
const mysql = require("mysql")

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});


router.get("/dashboard", (req, res) => {
  if (req.session && req.session.user) {
    res.render("dashboard");
  } else {
    res.redirect("/login");
  }
});

router.get("/add", (req, res) => {
  res.render("add");
});

router.get("/delete", (req, res) => {
  res.render("delete");
});

router.get("/search", (req, res) => {
  res.render("search");
});

router.get("/edit", (req, res) => {
  res.render("edit");
});

router.get("/view", (req, res) => {
  res.render("view");
});

router.get("/addtask", (req, res) => {
  //fetching data from form
  //res.send(req.query);
  //{"task":"hi","task_detail":"naai","date":"2023-07-19"}
  const { task, task_detail, date } = req.query

  // Sanitization Xss...

  let qry = "select * from task_table where task=?";
    db.query(qry, [task], (err, results) => {
        if (err)
            throw err
        else {

          //res.send(results);
            if (results.length > 0) {
                res.render("add", { checkmesg: true })
            } else {

                // insert query
                //db.query("INSERT INTO users SET ?",{ name: name, email: email, password: hashedPassword },(error, results) => {
                db.query("INSERT INTO task_table SET ?", {task: task, task_details: task_detail, date_added: date }, (err, results) => {
                  //res.send(results);
                  if (results.affectedRows > 0) {
                    res.render("add", { mesg: true })
                  }

                })
                /*let qry2 = "insert into task_table values(?,?,?)";
                db.query(qry2, [task, task_detail, date], (err, results) => {
                   res.send(results);
                  /*
                    http://localhost:7000/addtask?task=one&task_detail=one+task&date=2023-07-11
                    
                })*/
            }
        }
    })

});

module.exports = router;