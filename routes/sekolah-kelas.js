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

app.get("/:id_sekolah", (request, response) => {
  const { id_sekolah } = request.params;

  client.query(
    "Select k.id, k.nama_kelas, k.id_sekolah, k.id_jurusan, k.tingkat from kurikulum.kelas k where k.id_sekolah = $1",
    [id_sekolah],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      } else {
        console.error(err);
      }
    }
  );
});

module.exports = app;
