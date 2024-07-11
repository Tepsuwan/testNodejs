const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");
const mongo = require("./dbMong");
const client = mongo.client;
const db = mongo.db;

const employeeController = require("./controllers/EmployeeController");
const memberController = require("./controllers/MemberController");

app.use(cors());
app.use(
  fileupload({
    fileSize: 1 * 512 * 512, //50MB
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/myimage", express.static("uploads"));

const key = "1234";

function isSignIn(req, res, next) {
  try {
    const auth = req.headers["authorization"];
    const token = auth.replace("Bearer ", "");
    const jwt = require("jsonwebtoken");
    const payload = jwt.verify(token, key);

    if (payload.id != null) {
      next();
    } else {
      res.status(401).send("unauthorized");
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

app.get("/mongo/list", async (req, res) => {
  try {
    await client.connect();
    const dbObject = client.db(db);
    const member = dbObject.collection("member");
    const rows = await member
      .find({
        "name.fname": "Tepsuwan",
      })
      .toArray();

    res.send(rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/mongo/create", async (req, res) => {
  try {
    await client.connect();
    const dbObject = client.db(db);
    const member = dbObject.collection("member");

    const row = await member.insertOne({
      name: "Stefan",
      point: "1000",
    });

    res.send({ row });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/mongo/put", async (req, res) => {
  try {
    await client.connect();
    const dbObject = client.db(db);
    const member = dbObject.collection("member");

    const row = await member.updateOne({
      { _id:("")}
    });

    res.send({ row });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//
// upload
//
app.post("/upload", (req, res) => {
  try {
    if (req.files == undefined)
      return res.send({ message: "please choose file." });
    const img = req.files.img;

    if (img.truncated) return res.send({ message: "file over size" });

    // rename
    const myDate = new Date();
    const y = myDate.getFullYear();
    const m = myDate.getMonth() + 1;
    const d = myDate.getDate();
    const h = myDate.getHours();
    const mm = myDate.getMinutes();
    const s = myDate.getSeconds();
    const ms = myDate.getMilliseconds();

    const ext = img.name.split(".");
    const currentExt = ext[ext.length - 1];

    const newName = `${y}${m}${d}${h}${mm}${s}${ms}.${currentExt}`;

    console.log(img);

    img.mv("uploads/" + newName, (err) => {
      if (err) throw err;

      return res.send({ message: "success" });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//
// member
//
app.get("/member/list", (req, res) => memberController.list(req, res));
app.post("/member/create", (req, res) => memberController.create(req, res));
app.put("/member/update/:id", (req, res) => memberController.update(req, res));

app.post("/member/signIn", (req, res) => memberController.signIn(req, res));
app.get("/member/verify", (req, res) => memberController.verify(req, res));
app.get("/member/scretApi", isSignIn, (req, res, next) =>
  memberController.secretApi(req, res)
);

//
// employee
//

app.get("/employee/list", (req, res) => employeeController.list(req, res));
app.get("/employee/create", (req, res) => employeeController.create(req, res));
app.get("/employee/update/:id", (req, res) =>
  employeeController.update(req, res)
);
app.get("/employee/delete/:id", (req, res) =>
  employeeController.delete(req, res)
);

app.get("/employee/info/:id", (req, res) => employeeController.info(req, res));
app.get("/employee/search", (req, res) => employeeController.หำฟพแ้(req, res));

// app.get("/", (req, res) => {
//   return res.send("first api");
// });

app.get("/hello/:name", (req, res) => {
  const name = req.params.name;
  return res.send("Hello:" + name);
});

app.get("/hi/:name/:phone", (req, res) => {
  const name = req.params.name;
  const phone = req.params.phone;

  //   return res.send("hello" + name + " phone is " + phone);
  return res.send(`hello ${name} phone is ${phone}`);
});

app.post("/create", (req, res) => {
  const name = req.body.name ?? "";
  // if (name == undefined || name == null) name = ""

  return res.send("name is " + name);
});

app.put("/update/:id", (req, res) => {
  const id = req.body.id;
  const newData = req.body.newData;

  console.log(id, newData);
  return res.send({ message: "success" });
});

app.listen(3000, () => {
  console.log("server running on port localhost:3000");
});
