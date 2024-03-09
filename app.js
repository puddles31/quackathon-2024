const express = require("express");
const axios = require("axios");
const session = require("express-session");
const crypto = require("crypto");

const app = express();
app.set("view engine", "ejs");

// app.use("/resources", express.static(__dirname + "/resources"));
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
    data: [],
  });
});

app.post("/formsubmit", (req, res) => {
  const { age, age_of_payment, goal_amount, interest_rate } = req.body;

  let string_array = [];

  const duration = age_of_payment - age;

  for (let t_duration = 0; t_duration < duration; t_duration++) {
    for (let deposit = 100; deposit < 1000; deposit = deposit + 100) {
      let totalValue = 0;

      for (let i = 0; i < t_duration * 12; i++) {
        totalValue += deposit;
        totalValue += totalValue * (interest_rate / 100 / 12); // * 0.04
      }

      if (totalValue > goal_amount) {
        string_array.push([deposit, t_duration, interest_rate, totalValue]);
      }
    }
  }

  // order string_array by years descending
  string_array.sort((a, b) => {
    return b[1] - a[1];
  });

  // order string_array by closest to goal_amount
  string_array.sort((a, b) => {
    return Math.abs(a[3] - goal_amount) - Math.abs(b[3] - goal_amount);
  });

  // order string_array by deposit ascending
  string_array.sort((a, b) => {
    return a[0] - b[0];
  });

  string_array.length = 10;

  string_array.forEach((item) => {
    console.log(
      `Save £${item[0]} per month for ${item[1]} years at ${
        item[2]
      }% interest to get £${item[3].toFixed(2)}`
    );
  });

  const new_string_array = string_array.map((item) => {
    return `Save £${item[0]} per month for ${item[1]} years at ${
      item[2]
    }% interest to get £${item[3].toFixed(2)}`;
  });

  res.render("home", {
    title: "Home",
    data: new_string_array,
  });
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
  });
});
