const express = require("express");
const app = express.Router();
const multer = require("multer");
const client = require("../conection");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", (request, response) => {
  client.query("Select * from master.jenjang", (err, result) => {
    if (!err) {
      response.send(result.rows);
    }
  });
});

app.post("/", upload.none(), (request, response) => {
  const { urai, tingkat } = request.body;

  client.query(
    "INSERT INTO master.jenjang (urai, tingkat) VALUES ($1, $2) RETURNING *",
    [urai, tingkat],
    (err, result) => {
      if (!err) {
        response.send("Data berhasil dikirimkan");
      } else {
        console.error(err);
        response.status(500).json({ error: err.message });
      }
    }
  );
});

app.put("/:id", upload.none(), (request, response) => {
  const { urai, tingkat } = request.body;
  const { id } = request.params;
  client.query(
    "update master.jenjang set urai = $1, tingkat = $2 where id = $3",
    [urai, tingkat, id],
    (err, result) => {
      if (!err) {
        response.send("update success");
      } else {
        response.send(err.message);
      }
    }
  );
});

module.exports = app;
