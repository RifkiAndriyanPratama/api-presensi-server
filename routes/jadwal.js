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
  client.query("Select * from kurikulum.jadwal", (err, result) => {
    if (!err) {
      response.send(result.rows);
    }
  });
});

app.post("/", upload.none(), (request, response) => {
  const { nama_jadwal, jadwal } = request.body;

  client.query(
    "INSERT INTO kurikulum.jadwal (nama_jadwal, jadwal) VALUES ($1, $2) RETURNING *",
    [nama_jadwal, jadwal],
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
  const { nama_jadwal, jadwal } = request.body;
  const { id } = request.params;
  client.query(
    "update kurikulum.jadwal set nama_jadwal = $1, jadwal = $2 where id = $3",
    [nama_jadwal, jadwal, id],
    (err, result) => {
      if (!err) {
        response.send("update success");
      } else {
        response.send(err.message);
      }
    }
  );
});

app.delete("/:id", (request, response) => {
  const { id } = request.params;
  client.query(
    "delete from kurikulum.jadwal where id = $1",
    [id],
    (err, result) => {
      if (!err) {
        response.send("delete success");
      } else {
        response.send(err.message);
      }
    }
  );
});

app.get("/search/:nama_jadwal", (request, response) => {
  const { nama_jadwal } = request.params;
  client.query(
    "Select * from kurikulum.jadwal where nama_jadwal ilike $1",
    [`%${nama_jadwal}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

module.exports = app;
