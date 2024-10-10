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
    "select j.id, j.nama_jurusan, j.id_sekolah, s.nama_sekolah from master.jurusan j join master.sekolah s on j.id_sekolah = s.id",
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

app.post("/", upload.none(), (request, response) => {
  const { nama_jurusan } = request.body;
  const { id_sekolah } = request.body;

  client.query(
    "INSERT INTO master.jurusan (nama_jurusan, id_sekolah) VALUES ($1, $2) RETURNING *",
    [nama_jurusan, id_sekolah],
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
  const { nama_jurusan } = request.body;
  const { id_sekolah } = request.body;
  const { id } = request.params;
  client.query(
    "update master.jurusan set nama_jurusan = $1, id_sekolah = $2 where id = $3",
    [nama_jurusan, id_sekolah, id],
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
    "delete from master.jurusan where id = $1",
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

app.get("/search/:nama_jurusan", (request, response) => {
  const { nama_jurusan } = request.params;
  client.query(
    "Select j.id, j.nama_jurusan, s.nama_sekolah from master.jurusan j join master.sekolah s on j.id_sekolah = s.id where j.nama_jurusan ilike $1 or s.nama_sekolah ilike $1",
    [`%${nama_jurusan}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

app.get("/search/:id_sekolah/:nama_jurusan", (request, response) => {
  const { id_sekolah, nama_jurusan } = request.params;
  client.query(
    "Select j.id, j.nama_jurusan, s.nama_sekolah from master.jurusan j join master.sekolah s on j.id_sekolah = s.id where j.id_sekolah = $1 and j.nama_jurusan ilike $2",
    [id_sekolah, `%${nama_jurusan}%`],
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
