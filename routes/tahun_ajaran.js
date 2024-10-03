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
  client.query("Select * from master.tahun_ajaran", (err, result) => {
    if (!err) {
      response.send(result.rows);
    }
  });
});

app.post("/", upload.none(), (request, response) => {
  const { tahun_ajaran } = request.body;

  client.query(
    "INSERT INTO master.tahun_ajaran (tahun_ajaran) VALUES ($1) RETURNING *",
    [tahun_ajaran],
    (err, result) => {
      if (!err) {
        response.send("Data berhasil dikirimkan");
        // response.status(201).json(result.rows[0]);
      } else {
        console.error(err);
        response.status(500).json({ error: err.message });
      }
    }
  );
});

app.put("/:id", upload.none(), (request, response) => {
  const { tahun_ajaran } = request.body;
  const { id } = request.params;
  client.query(
    "update master.tahun_ajaran set tahun_ajaran = $1 where id = $2",
    [tahun_ajaran, id],
    (err, result) => {
      if (!err) {
        response.send("update success");
      } else {
        response.send(err.message);
      }
    }
  );
});

app.get("/search/:tahun_ajaran", (request, response) => {
  const { tahun_ajaran } = request.params;
  client.query(
    "Select * from master.tahun_ajaran where tahun_ajaran ilike $1",
    [`%${tahun_ajaran}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

module.exports = app;
