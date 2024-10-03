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
  client.query(
    "Select k.id, k.id_jurusan, k.id_sekolah, s.nama_sekolah, j.nama_jurusan, k.tingkat, k.nama_kelas from kurikulum.kelas k join master.sekolah s on k.id_sekolah = s.id join master.jurusan j on k.id_jurusan = j.id",
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

app.post("/", upload.none(), (request, response) => {
  const { id_sekolah, id_jurusan, tingkat, nama_kelas } = request.body;

  client.query(
    "INSERT INTO kurikulum.kelas (id_sekolah, id_jurusan, tingkat, nama_kelas) VALUES ($1, $2, $3, $4) RETURNING *",
    [id_sekolah, id_jurusan, tingkat, nama_kelas],
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
  const { id_sekolah, id_jurusan, tingkat, nama_kelas } = request.body;
  const { id } = request.params;
  client.query(
    "update kurikulum.kelas set id_sekolah = $1, id_jurusan = $2, tingkat = $3, nama_kelas = $4 where id = $5",
    [id_sekolah, id_jurusan, tingkat, nama_kelas, id],
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
    "delete from kurikulum.kelas where id = $1",
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

app.get("/search/:nama_kelas", (request, response) => {
  const { nama_kelas, nama_sekolah, nama_jurusan } = request.params;
  client.query(
    "Select k.id, k.id_sekolah, k.id_jurusan, k.tingkat, k.nama_kelas, s.nama_sekolah, j.nama_jurusan from kurikulum.kelas k join master.sekolah s on k.id_sekolah = s.id  join master.jurusan j on k.id_jurusan = j.id where nama_kelas ilike $1 or nama_sekolah ilike $1 or nama_jurusan ilike $1",
    [`%${nama_kelas}%`],
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
