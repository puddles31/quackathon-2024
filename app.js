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
    title: "Savings Planner",
    data: [],
    graphData: [],
    spent_instead: "",
    zero_interest_string: "",
    zero_interest: 0,
  });
});

app.get("/compounding", (req, res) => {
  res.render("compounding", {
    title: "Compound Interest",
    data: [],
    graphData: [],
    result: 0,
    balance: null,
    interest_rate: null,
  });
});

app.get("/child-savings", (req, res) => {
  res.render("child-savings", {
    title: "Child Savings",
    data: [],
    graphData: [],
    spent_instead: "",
    zero_interest_string: "",
    zero_interest: 0,
    age: null,
    age_of_payment: null,
    goal_amount: null,
    interest_rate: null,
  });
});

app.get("/pensions", (req, res) => {
  res.render("pensions", {
    title: "Pensions",
    data: [],
    graphData: [],
    spent_instead: "",
    zero_interest_string: "",
    zero_interest: 0,
    age: null,
    retirement_age: null,
    monthly_contribution: null,
    current_pension_savings: null,
  });
});

app.get("/lisa", (req, res) => {
  res.render("lisa", {
    title: "LISA",
    data: [],
    graphData: [],
    spent_instead: "",
    zero_interest_string: "",
    zero_interest: 0,
    age: null,
    age_of_payment: null,
    goal_amount: null,
    interest_rate: null,
  });
});

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

app.post("/compounding", (req, res) => {
  const { balance, interest_rate } = req.body;

  const result = 72 / interest_rate;

  let totalValue = 0;
  let graphData = [];
  totalValue += parseFloat(balance);

  for (let i = 1; i <= 50; i++) {
    totalValue += parseFloat(totalValue) * (parseFloat(interest_rate) / 100); // * 0.04

    graphData.push(totalValue);
  }

  res.render("compounding", {
    title: "Compound Interest",
    graphData: graphData,
    result: result.toFixed(2),
    balance,
    interest_rate,
  });
});

app.post("/child-savings", (req, res) => {
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
    // console.log(
    //   `Save £${item[0]} per month for ${item[1]} years at ${
    //     item[2]
    //   }% interest to get £${item[3].toFixed(2)}`
    // );
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
  // console.log(total_graph_data_array);

  // with zero interest rate:
  let zero_interest = 0;
  for (let i = 1; i <= new_string_array[0][1] * 12; i++) {
    zero_interest += new_string_array[0][0];
  }

  console.log(zero_interest);

  // if spent instead:
  let spent_instead = 0;
  for (let i = 1; i <= new_string_array[0][1] * 12; i++) {
    spent_instead += new_string_array[0][0];
  }

  res.render("child-savings", {
    title: "Child Savings",
    data: new_string_array,
    graphData: total_graph_data_array,
    spent_instead: numberWithCommas(spent_instead),
    zero_interest_string: numberWithCommas(zero_interest),
    zero_interest: zero_interest,
    age,
    age_of_payment,
    goal_amount,
    interest_rate,
  });
});

app.post("/pensions", (req, res) => {
  const { age, retirement_age, monthly_contribution, current_pension_savings } =
    req.body;

  const yearsUntilRetirement = retirement_age - age; // Calculate the number of years until retirement

  let graphData = [];
  let yearlyValues = [];

  for (
    let annualGrowthRate = 1.05;
    annualGrowthRate >= 1.02;
    annualGrowthRate -= 0.015
  ) {
    // for years calculate the pension pot value at the end of each year
    yearlyValues = [];
    let totalPensionPot = parseInt(current_pension_savings);

    for (let year = 1; year <= yearsUntilRetirement; year++) {
      // Calculate the pension pot value at the end of the year
      totalPensionPot =
        parseInt(totalPensionPot) + parseInt(monthly_contribution) * 12; // Add contribution to the pension pot
      totalPensionPot = parseInt(totalPensionPot) * annualGrowthRate; // Add annual growth to the pension pot
      yearlyValues.push(totalPensionPot); // Add the pension pot value to the array
    }

    graphData.push(yearlyValues);
  }
  // console.log(graphData);

  // Retain yearlyValues for 2% growth rate
  const privatePensionPot = yearlyValues[yearlyValues.length - 1]; // Total pension pot value
  const taxFreeLumpSum = 0.25 * privatePensionPot; // 25% tax free lump sum
  const privatePensionPotAfterSum = privatePensionPot - taxFreeLumpSum; // Remaining pension pot
  const annualPrivatePension = privatePensionPotAfterSum / 20; // 20 year annuity

  const annualStatePension = 10600; // Annual state pension

  res.render("pensions", {
    title: "Pensions",
    graphData: graphData,
    pieGraphLumpSum: taxFreeLumpSum,
    pieGraphPotAfterSum: privatePensionPotAfterSum,
    barGraphPrivatePension: annualPrivatePension,
    barGraphStatePension: annualStatePension,
    age: age,
    retirement_age: retirement_age,
    monthly_contribution: monthly_contribution,
    current_pension_savings: current_pension_savings,
  });
});

app.post("/lisa", (req, res) => {
  const { age, age_of_payment, goal_amount, interest_rate } = req.body;

  let string_array = [];
  let total_graph_data_array = [];

  const duration = age_of_payment - age;

  for (let t_duration = 0; t_duration <= duration; t_duration++) {
    let graphData = [];
    for (let deposit = 10; deposit < 10000; deposit = deposit + 10) {
      let totalValue = 0;

      for (let i = 1; i <= t_duration * 12; i++) {
        totalValue += deposit + deposit * 0.25;
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
    // console.log(
    //   `Save £${item[0]} per month for ${item[1]} years at ${
    //     item[2]
    //   }% interest to get £${item[3].toFixed(2)}`
    // );
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
  // console.log(total_graph_data_array);

  // with zero interest rate:
  let zero_interest = 0;
  for (let i = 1; i <= new_string_array[0][1] * 12; i++) {
    zero_interest += new_string_array[0][0];
  }

  // if spent instead:
  let spent_instead = 0;
  for (let i = 1; i <= new_string_array[0][1] * 12; i++) {
    spent_instead += new_string_array[0][0];
  }

  res.render("lisa", {
    title: "LISA",
    data: new_string_array,
    graphData: total_graph_data_array,
    spent_instead: numberWithCommas(spent_instead),
    zero_interest_string: numberWithCommas(zero_interest),
    zero_interest: zero_interest,
    age: age,
    age_of_payment: age_of_payment,
    goal_amount: goal_amount,
    interest_rate: interest_rate,
  });
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
  });
});
