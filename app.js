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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

app.post("/formsubmit", (req, res) => {
  const { age, age_of_payment, goal_amount, interest_rate } = req.body;

  let string_array = [];
  let total_graph_data_array = [];

  const duration = age_of_payment - age;

  for (let t_duration = 0; t_duration <= duration; t_duration++) {
    let graphData = [];
    for (let deposit = 10; deposit < 10000; deposit = deposit + 10) {
      let totalValue = 0;

      for (let i = 1; i <= t_duration * 12; i++) {
        totalValue += deposit;
        totalValue += totalValue * (interest_rate / 100 / 12); // * 0.04

        graphData.push(totalValue);
      }

      if (totalValue > goal_amount) {
        string_array.push([deposit, t_duration, interest_rate, totalValue]);
      }
    }
  }

  let without_interest = 0;

  // limit string_array to 1 of each deposit value:
  string_array = string_array.filter((item, index, self) => {
    return (
      index ===
      self.findIndex((t) => {
        return t[0] === item[0];
      })
    );
  });

  // limit string_array to 1 of each duration value:
  string_array = string_array.filter((item, index, self) => {
    return (
      index ===
      self.findIndex((t) => {
        return t[1] === item[1];
      })
    );
  });

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
    // return `Save £${item[0]} per month for ${item[1]} years at ${
    //   item[2]
    // }% interest to get £${item[3].toFixed(2)}`;
    return [
      item[0],
      item[1],
      item[2],
      item[3].toFixed(2),
      numberWithCommas(item[3].toFixed(2)),
    ];
  });

  for (let i in new_string_array) {
    let graphData = [];
    let totalValue = 0;
    for (let j = 1; j <= new_string_array[i][1] * 12; j++) {
      for (let k = 1; k <= j; k++) {
        if (totalValue > goal_amount) {
          break;
        }
        totalValue += new_string_array[i][0];
        totalValue += totalValue * (new_string_array[i][2] / 100 / 12); // * 0.04
        graphData.push(totalValue);
      }
    }
    total_graph_data_array.push(graphData);
  }
  console.log(total_graph_data_array);

  // with zero interest rate:
  let zero_interest = 0;
  for (let i = 1; i <= duration * 12; i++) {
    zero_interest += new_string_array[0][0];
  }

  // if spent instead:
  let spent_instead = 0;
  for (let i = 1; i <= duration * 12; i++) {
    spent_instead += new_string_array[0][0];
  }

  res.render("home", {
    title: "Home",
    data: new_string_array,
    graphData: total_graph_data_array,
    spent_instead: numberWithCommas(spent_instead),
    zero_interest_string: numberWithCommas(zero_interest),
    zero_interest: zero_interest,
  });
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
  });
});
