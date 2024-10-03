const express = require("express");
const app = express.Router();
const multer = require("multer");
const client = require("../conection");
const authMiddleware = require("../middleware/auth");

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
  client.query(
    "Select s.id, s.nama_sekolah, s.alamat, s.npsn, s.id_jenjang, j.urai, j.tingkat from master.sekolah s join master.jenjang j on s.id_jenjang = j.id",
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      } else {
        console.error(err);
      }
    }
  );
});

app.post("/", upload.none(), (request, response) => {
  const { nama_sekolah, alamat, npsn, id_jenjang } = request.body;

  client.query(
    "INSERT INTO master.sekolah (nama_sekolah, alamat, npsn, id_jenjang) VALUES ($1, $2, $3, $4) RETURNING *",
    [nama_sekolah, alamat, npsn, id_jenjang],
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
  const { nama_sekolah, alamat, npsn, id_jenjang } = request.body;
  const { id } = request.params;
  client.query(
    "update master.sekolah set nama_sekolah = $1, alamat = $2, npsn = $3, id_jenjang = $4 where id = $5",
    [nama_sekolah, alamat, npsn, id_jenjang, id],
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
    "delete from master.sekolah where id = $1",
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

app.get("/search/:nama_sekolah", (request, response) => {
  const { nama_sekolah } = request.params;
  client.query(
    "Select s.id, s.nama_sekolah, s.alamat, s.npsn, j.id as id_jenjang, j.urai, j.tingkat from master.sekolah s join master.jenjang j on s.id_jenjang = j.id where nama_sekolah ilike $1",
    [`%${nama_sekolah}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      } else {
        response.status(500).send(err.message);
      }
    }
  );
});

module.exports = app;
