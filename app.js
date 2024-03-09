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

app.get("/institutions", async (req, res) => {
  const institutionsConfig = {
    method: "get",
    url: "https://api.yapily.com/institutions",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          "aeb4b47e-db4c-4adc-b23a-da1125ea99af:AXGJbNpY2mxEvIMB1pIlpu5RoONliMOS"
        ).toString("base64"),
    },
  };
  const data = await axios(institutionsConfig);
  res.json(data.data);
});

app.post("/auth", async (req, res) => {
  const { userID, institutionID } = req.body;
  const query = new URLSearchParams({
    raw: "true",
  }).toString();

  const authConfig = {
    method: "post",
    url: `https://api.yapily.com/account-auth-requests?${query}`,
    data: JSON.stringify({
      applicationUserId: userID,
      institutionId: institutionID,
      callback: "http://localhost:3000/callback",
    }),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization:
        "Basic " +
        Buffer.from(
          "aeb4b47e-db4c-4adc-b23a-da1125ea99af:AXGJbNpY2mxEvIMB1pIlpu5RoONliMOS"
        ).toString("base64"),
    },
  };

  const data = await axios(authConfig);
  //   res.redirect(data.data.authorisationURL);
  res.json(data.data);
});

app.get("/callback", async (req, res) => {
  const consentToken = req.query.consent;
  req.session.user = {
    consentToken: consentToken,
  };
  res.redirect("/accounts");
});

app.get("/accounts", async (req, res) => {
  const query = new URLSearchParams({ raw: "true" }).toString();

  const accountsConfig = {
    method: "get",
    url: `https://api.yapily.com/accounts?${query}`,
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          "aeb4b47e-db4c-4adc-b23a-da1125ea99af:AXGJbNpY2mxEvIMB1pIlpu5RoONliMOS"
        ).toString("base64"),
    },
  };

  const data = await axios(accountsConfig);
  res.json(data.data);
});

app.get("/accountData", async (req, res) => {
  const accountDataConfig = {
    method: "post",
    url: "https://api.yapily.com/account-auth-requests",
    data: JSON.stringify({
      applicationUserId: "mits",
      institutionId: "modelo-sandbox",
      callback: "https://localhost:3000/",
    }),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization:
        "Basic " +
        Buffer.from(
          "aeb4b47e-db4c-4adc-b23a-da1125ea99af:AXGJbNpY2mxEvIMB1pIlpu5RoONliMOS"
        ).toString("base64"),
    },
  };

  const result = await axios(accountDataConfig);
  console.log("Hello");
  const consentToken = result.data.consentID;

  const accountsConfig = {
    method: "get",
    url: `https://api.yapily.com/accounts`,
    headers: {
      consent: consentToken,
      Authorization:
        "Basic " +
        Buffer.from(
          "aeb4b47e-db4c-4adc-b23a-da1125ea99af:AXGJbNpY2mxEvIMB1pIlpu5RoONliMOS"
        ).toString("base64"),
    },
  };

  const data = await axios(accountsConfig);
  res.json(data.data);
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
  });
});
