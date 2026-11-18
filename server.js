const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

// create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// connect
db.connect((err) => {
  if(err) throw err;
  console.log("MySql connected... ");
})
const app = express();

app.set('view engine', 'ejs');

// 1. Add this middleware so Express can read form data in req.body
app.use(express.urlencoded({ extended: true }));

//can access the styles.css
app.use(express.static('public'));

const port = 3000;

app.get('/', (req, res) => {
  res.render('login')
});

app.post('/homepage', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;


  db.query(
    'SELECT name, username, password_hash FROM users WHERE username = ?', //shoudlt it also include pass.. = ?
    [username], 
    (err, rows) => {
      if(err){ throw err; }

      if (rows.length == 0) {
        console.log('username doesn\'t exist');
        res.status(401).send("username or password is incorrect");
        return;
      }

      let user = rows[0];
      let username_exists = false, password_matches = false;

      if (rows[0].username == username) {
        username_exists = true;
        if(rows[0].password_hash == password){ password_matches = true; }
      }

      if(username_exists && password_matches){
        const name = user.name;
        res.render('homepage', { name });
      } else {
        res.status(401).send("username or password is incorrect");
      }
  });
});

app.get('/signup', (req, res) => {
  res.render('signup')
});

// sign in   let sql = 'INSERT INTO users (1, username, password, name) VALUES (?, ?, ?, ?)';




app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
});