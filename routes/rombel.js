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
    "select r.id, r.nama_rombel, r.id_siswa, r.id_tahun_ajaran, r.id_jadwal, t.tahun_ajaran, s.nama_sekolah, k.nama_kelas, j.nama_jadwal, s2.nama, r.id_sekolah, r.id_kelas from kurikulum.rombel r join master.tahun_ajaran t on r.id_tahun_ajaran = t.id join master.sekolah s on r.id_sekolah = s.id join kurikulum.kelas k on r.id_kelas = k.id join siswa.siswa s2 on r.id_siswa = s2.id join kurikulum.jadwal j on r.id_jadwal = j.id",
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
  const {
    id_kelas,
    id_sekolah,
    id_tahun_ajaran,
    id_jadwal,
    id_siswa,
    nama_rombel,
  } = request.body;

  client.query(
    "INSERT INTO kurikulum.rombel (id_kelas, id_sekolah, id_tahun_ajaran, id_jadwal, id_siswa, nama_rombel) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [id_kelas, id_sekolah, id_tahun_ajaran, id_jadwal, id_siswa, nama_rombel],
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
  const {
    id_kelas,
    id_sekolah,
    id_tahun_ajaran,
    id_jadwal,
    id_siswa,
    nama_rombel,
  } = request.body;
  const { id } = request.params;
  client.query(
    "update kurikulum.rombel set id_kelas = $1, id_sekolah = $2, id_tahun_ajaran = $3, id_jadwal = $4, id_siswa = $5, nama_rombel = $6 where id = $7",
    [
      id_kelas,
      id_sekolah,
      id_tahun_ajaran,
      id_jadwal,
      id_siswa,
      nama_rombel,
      id,
    ],
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
    "delete from kurikulum.rombel where id = $1",
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

app.get("/search/:nama_rombel", (request, response) => {
  const { nama_rombel } = request.params;
  client.query(
    "Select r.id, r.id_kelas, r.id_sekolah, r.id_tahun_ajaran, r.id_jadwal, r.id_siswa, t.tahun_ajaran, s.nama_sekolah, r.nama_rombel, k.nama_kelas, j.nama_jadwal, ss.nama  from kurikulum.rombel r join master.sekolah s on r.id_sekolah = s.id join master.tahun_ajaran t on r.id_tahun_ajaran = t.id join kurikulum.kelas k on r.id_kelas = k.id join kurikulum.jadwal j on r.id_jadwal = j.id join siswa.siswa ss on r.id_siswa = ss.id where nama_rombel ilike $1 or nama_sekolah ilike $1",
    [`%${nama_rombel}%`],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      } else {
        response.send(err.message);
      }
    }
  );
});

module.exports = app;
