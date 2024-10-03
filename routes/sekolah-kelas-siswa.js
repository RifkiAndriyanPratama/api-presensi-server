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

app.get("/:id_sekolah/:id", (request, response) => {
  const { id_sekolah, id } = request.params;
  client.query(
    `SELECT k.id_sekolah, sc.nama_sekolah, k.id, k.nama_kelas, s.id as id_siswa, s.nama 
     FROM master.sekolah sc 
     JOIN kurikulum.kelas k ON sc.id = k.id_sekolah 
     JOIN siswa.siswa s ON k.id = s.id_kelas 
     WHERE k.id_sekolah = $1 AND k.id = $2`,
    [id_sekolah, id],
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
