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
    "Select j.id, j.id_sekolah, j.id_rombel, s.nama_sekolah, r.nama_rombel, j.hari, j.jam_sekolah from kurikulum.jam_sekolah j join master.sekolah s on j.id_sekolah = s.id join kurikulum.rombel r on j.id_rombel = r.id",
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      } else {
        response.send(err.message);
      }
    }
  );
});

app.post("/", upload.none(), (request, response) => {
  const { id_sekolah, id_rombel, hari, jam_sekolah } = request.body;

  client.query(
    "INSERT INTO kurikulum.jam_sekolah (id_sekolah, id_rombel, hari, jam_sekolah) VALUES ($1, $2, $3, $4) RETURNING *",
    [id_sekolah, id_rombel, hari, jam_sekolah],
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
  const { id_sekolah, id_rombel, hari, jam_sekolah } = request.body;
  const { id } = request.params;
  client.query(
    "update kurikulum.jam_sekolah set id_sekolah = $1, id_rombel = $2, hari = $3, jam_sekolah = $4 where id = $5",
    [id_sekolah, id_rombel, hari, jam_sekolah, id],
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
    "delete from kurikulum.jam_sekolah where id = $1",
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

app.get("/search/:hari", (request, response) => {
  const { hari } = request.params;
  client.query(
    "Select * from kurikulum.jam_sekolah join master.sekolah s on jam_sekolah.id_sekolah = s.id join kurikulum.rombel r on jam_sekolah.id_rombel = r.id where hari ilike $1 or nama_sekolah ilike $1 or nama_rombel ilike $1",
    [`%${hari}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

module.exports = app;
