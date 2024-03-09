const express = require("express");
const axios = require("axios");
const session = require("express-session");
const crypto = require("crypto");

const app = express();
app.set("view engine", "ejs");

app.use("/dist", express.static(__dirname + "/dist"));
app.use(express.urlencoded());
app.use(express.json());
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

const secretKey = generateSecretKey();
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
  });
});

app.post("/formsubmit", (req, res) => {
  const { age, ageOfPay, goalValue } = req.body;

  const duration = ageOfPay - age;
  let totalValue = 0;
  let depositValue = 100;
  let rate = 4;

  for (let i = 0; i < duration; i++) {
    totalValue += depositValue;
    totalValue += totalValue * (4 / 100); // * 0.04
  }

  console.log(totalValue);
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
  });
});
