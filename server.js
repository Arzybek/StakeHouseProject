const express = require("express");
const hbs = require("hbs");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const jsonParser = express.json();
var nodemailer = require('nodemailer');

const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});
let dbClient;
mongoClient.connect(function (err, client) {
    if (err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("web").collection("orders");
});

var transporter = nodemailer.createTransport({
    service: 'Yandex',
    auth: {
        user: '',
        pass: ''
    }
});

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.static(__dirname + "/public"));

app.get("/api/records/:date", function (req, res) {
    //const id = new objectId(req.params.date);
    console.log(req.params.date)
    const collection = req.app.locals.collection;
    collection.find({date: req.params.date}).toArray(function (err, users) {
        if (err) return console.log(err);
        res.send(users);
    });
});

app.post("/api/records", jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const userName = req.body.name;
    const userMail = req.body.email;
    const userPhone = req.body.phone;
    const userDate = req.body.date;
    const userTime = req.body.time.toString().split(":")[0];
    const user = {name: userName, email: userMail, phone: userPhone, date: userDate, time: userTime};

    const collection = req.app.locals.collection;
    collection.insertOne(user, function (err, result) {
        if (err) return console.log(err);
        res.send(user);
    });

    var mailOptions = {
        from: '',
        to: userMail,
        subject: 'Заказ столика',
        text: `Поздравляем, ${userName}, вы заказали столик в ресторане Et-King` +
            ` на ${req.body.time} ${userDate}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
});

app.use("/contact", function (request, response) {
    response.render("contact", {
        title: "Наши контакты:",
        email: "et.king@whatever.com",
        phone: "+7-133-732-277-7 (fake number)"
    });
});

app.use("/order", function (request, response) {
    response.render("order", {
        title: "Забронировать столик"
    });
});

app.use("/success", function (request, response) {
    response.render("success", {
        title: "Ждём в гости"
    });
});

app.use("/menu", function (request, response) {
    response.render("menu", {
        title: "Меню"
    });
});

app.use("/", function (request, response) {
    response.render("home", {
        title: "Ресторан Et King"
    });
});

process.on("SIGINT", () => {
    dbClient.close();
    console.log("shutting down")
    process.exit();
});

app.listen(3000);