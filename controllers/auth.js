const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  console.log(req.body);

  //const name = req.body.name;
  //const email = req.body.email;
  //const password = req.body.password;
  //const passwordConfirm = req.body.passwordConfirm;

  const { name, email, password, passwordConfirm } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results.length > 0) {
        return res.render("register", {
          message: "This email is already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Passwords do not match!",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      db.query("INSERT INTO users SET ?",{ name: name, email: email, password: hashedPassword },(error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log(results);
            return res.render("register", {
                message: "User registered!",
            });
        }
        });
    });

    //res.send("testing");
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results.length === 0) {
        return res.render("login", {
          message: "Invalid email or password",
        });
      }

      const user = results[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.render("login", {
          message: "Invalid email or password",
        });
      }

      // Generate a JSON Web Token (JWT) for authentication
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Store the token in a cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
        signed: true,
      });

      req.session.user = {
        id: results[0].id,
        email: results[0].email,
        // Add any other relevant user data to the session object
      };

      res.redirect("/dashboard");
    }
  );
};
