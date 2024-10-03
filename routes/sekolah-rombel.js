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
    "Select r.id, r.nama_rombel, r.id_sekolah from kurikulum.rombel r join master.sekolah s on r.id_sekolah = s.id where r.id_sekolah = $1",
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
