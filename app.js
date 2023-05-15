const express = require('express')
const db = require("./routes/db-config")
const path = require('path');

const bodyParser = require("body-parser")
const encoder = bodyParser.urlencoded()
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.connect(function(error) {
    if (error) throw error;
    else console.log("Connection to DB successful!");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/room'));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/signup.html");
})

app.post("/signup", encoder, function(req, res) {

    var username = req.body.username
    var password = req.body.password

    db.query("insert into User (email, password) values(?,?)", [username, password], function(error, results, fields) {
        if (error) {
            console.log(error);
            res.redirect("/");
        } else {
            res.redirect("/login");
        }
        //res.end();
    })
})

//when signed up
app.get("/login", function(req, res) {
    res.sendFile(__dirname + "/public/login.html");
});

app.post("/login", encoder, function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    db.query("SELECT * FROM User WHERE email = ? AND password = ?", [username, password], function(error, results, fields) {
        if (error) {
            console.log(error);
            res.redirect("/");
        } else if (results.length > 0) {
            res.redirect("/homepage");
        } else {
            res.send("Invalid username or password");
        }
    })
});

//when login is success
app.get("/homepage", function(req, res) {
    res.sendFile(__dirname + "/public/homepage.html");
});

app.get("/Livingroom", function(req, res) {
    // res.sendFile(__dirname + "/public/room/livingroom.html");
    db.query("SELECT temperature, humidity, lightness FROM DetectData WHERE roomID = 1 ORDER BY time DESC LIMIT 1", function(error, results, fields) {
        if (error) {
            console.log(error);
            res.sendFile(__dirname + "/public/error.html");
        } else if (results.length > 0) {
            res.render(__dirname + "/public/room/livingroom.ejs", { temperature: results[0].temperature, humidity: results[0].humidity, lightness: results[0].lightness });
        } //else {
        //     res.render(__dirname + "/public/room/livingroom.ejs", { temperature: "N/A", humidity: "N/A", lightness: "N/A" });
        // }
    });
});

app.post('/update', (req, res) => {
    const { temperature, humidity, lightness, humanDetection } = req.body;

    db.query('UPDATE DataCriteria SET temperature = ?, humidity = ?, lightness = ? WHERE roomID = ?', [temperature, humidity, lightness, 4], (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(500).send('Failed to update data.');
        } else {
            // Insert the data into the DetectData table
            db.query('INSERT INTO DetectData (roomID, time, temperature, humidity, lightness) VALUES (?, NOW(), ?, ?, ?)', [4, temperature, humidity, lightness], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Failed to insert data.');
                } else {
                    res.status(200).send('Data updated and inserted successfully.');
                }
            });
        }
    });
});

app.get("/Bedroom", function(req, res) {
    res.sendFile(__dirname + "/public/room/bedroom.html");
});

app.get("/Kitchen", function(req, res) {
    res.sendFile(__dirname + "/public/room/kitchen.html");
});

app.get("/Bathroom", function(req, res) {
    db.query("SELECT temperature, humidity, lightness FROM DetectData WHERE roomID = 4 ORDER BY time DESC LIMIT 1", function(error, results, fields) {
        if (error) {
            console.log(error);
            res.sendFile(__dirname + "/public/error.html");
        } else if (results.length > 0) {
            res.render(__dirname + "/public/room/bathroom.ejs", { temperature: results[0].temperature, humidity: results[0].humidity, lightness: results[0].lightness });
        } else {
            res.render(__dirname + "/public/room/bathroom.ejs", { temperature: "N/A", humidity: "N/A", lightness: "N/A" });
        }
    });
});

app.post('/update', (req, res) => {
    const { temperature, humidity, lightness, humanDetection } = req.body;

    db.query('UPDATE DataCriteria SET temperature = ?, humidity = ?, lightness = ?, humanDetection = ? WHERE roomID = ?', [temperature, humidity, lightness, humanDetection, 4], (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(500).send('Failed to update data.');
        } else {
            // Insert the data into the DetectData table
            db.query('INSERT INTO DetectData (roomID, time, temperature, humidity, lightness) VALUES (?, NOW(), ?, ?, ?)', [4, temperature, humidity, lightness], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Failed to insert data.');
                } else {
                    res.status(200).send('Data updated and inserted successfully.');
                }
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Web app listening on port 3000')
})