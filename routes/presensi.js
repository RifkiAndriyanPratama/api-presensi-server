const express = require("express");
const app = express.Router();
const multer = require("multer");
const client = require("../conection");
const moment = require("moment-timezone");

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
    "SELECT p.id, p.id_sekolah, p.waktu, p.id_siswa, p.jam_standar_datang, p.jam_standar_pulang, p.jam_datang, p.jam_pulang, p.foto, s.nama_sekolah, ss.nama as nama_siswa FROM presensi.data_presensi p JOIN master.sekolah s ON p.id_sekolah = s.id JOIN siswa.siswa ss ON p.id_siswa = ss.id",
    (err, result) => {
      if (!err) {
        console.log("Data dari database:", result.rows); // Tambahkan log ini
        // Format timestamp
        const formattedRows = result.rows.map((row) => {
          return {
            ...row,
            waktu: moment
              .tz(row.waktu, "Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss"),
            jam_pulang: moment
              .tz(row.jam_pulang, "Asia/Jakarta")
              .format("HH:mm:ss"),
          };
        });
        response.send(formattedRows);
      } else {
        console.error("Error saat query:", err); // Tambahkan log ini
        response.status(500).send(err);
      }
    }
  );
});

app.post("/masuk", upload.single("foto"), (request, response) => {
  const {
    id_sekolah,
    waktu,
    id_siswa,
    jam_standar_datang,
    jam_standar_pulang,
    jam_datang,
  } = request.body;
  const foto = request.file ? request.file.path : null;

  client.query(
    "INSERT INTO presensi.data_presensi (id_sekolah, waktu, id_siswa, jam_standar_datang, jam_standar_pulang, jam_datang, jam_pulang, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      id_sekolah,
      waktu,
      id_siswa,
      jam_standar_datang,
      jam_standar_pulang,
      jam_datang,
      null,
      foto,
    ],
    (err, result) => {
      if (!err) {
        response.send("Presensi Masuk Berhasil");
      } else {
        console.error(err);
        response.status(500).json({ error: err.message });
      }
    }
  );
});

app.put("/pulang/:id", (request, response) => {
  const { id } = request.params;

  const currentTime = moment().tz("Asia/Jakarta").format("HH:mm:ss");

  client.query(
    "UPDATE presensi.data_presensi SET jam_pulang = $1 WHERE id = $2 RETURNING *",
    [currentTime, id],
    (err, result) => {
      if (!err) {
        if (result.rowCount > 0) {
          response.send("Presensi Pulang Berhasil");
        } else {
          response.status(404).send("Presensi tidak ditemukan");
        }
      } else {
        console.error(err);
        response.status(500).json({ error: err.message });
      }
    }
  );
});


app.get("/search/:presensi", (request, response) => {
  const { presensi } = request.params;
  client.query(
    "SELECT p.id, p.id_sekolah, p.waktu, p.id_siswa, p.jam_standar_datang, p.jam_standar_pulang, p.jam_datang, p.jam_pulang, p.foto, s.nama_sekolah, ss.nama as nama_siswa FROM presensi.data_presensi p JOIN master.sekolah s ON p.id_sekolah = s.id JOIN siswa.siswa ss ON p.id_siswa = ss.id WHERE ss.nama ilike $1",
    [`%${presensi}%`],
    (err, result) => {
      if (!err) {
        const formattedRows = result.rows.map((row) => {
          return {
            ...row,
            waktu: moment
              .tz(row.waktu, "Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss"),
            jam_pulang: moment
              .tz(row.jam_pulang, "Asia/Jakarta")
              .format("HH:mm:ss"),
          };
        });
        response.send(formattedRows);
      } else {
        response.status(500).send(err.message);
      }
    }
  );
});

app.get("/search/:id_sekolah/:presensi", (request, response) => {
  const { id_sekolah, presensi } = request.params;
  client.query(
    "SELECT p.id, p.id_sekolah, p.waktu, p.id_siswa, p.jam_standar_datang, p.jam_standar_pulang, p.jam_datang, p.jam_pulang, p.foto, s.nama_sekolah, ss.nama as nama_siswa FROM presensi.data_presensi p JOIN master.sekolah s ON p.id_sekolah = s.id JOIN siswa.siswa ss ON p.id_siswa = ss.id WHERE s.id = $1 ss.nama ilike $2",
    [id_sekolah, `%${presensi}%`],
    (err, result) => {
      if (!err) {
        const formattedRows = result.rows.map((row) => {
          return {
            ...row,
            waktu: moment
              .tz(row.waktu, "Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss"),
            jam_pulang: moment
              .tz(row.jam_pulang, "Asia/Jakarta")
              .format("HH:mm:ss"),
          };
        });
        response.send(formattedRows);
      } else {
        response.status(500).send(err.message);
      }
    }
  );
});

module.exports = app;
