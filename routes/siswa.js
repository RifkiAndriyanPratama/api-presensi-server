const express = require("express");
const app = express.Router();
const multer = require("multer");
const client = require("../conection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
    "Select s.id, s.id_sekolah, s.id_kelas, s.nis, s.nama, s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.alamat, s.tahun_masuk, s.no_ortu, s.no_hp, s.password, sc.nama_sekolah, k.nama_kelas, r.name as role from siswa.siswa s join master.sekolah sc on s.id_sekolah = sc.id join kurikulum.kelas k on s.id_kelas = k.id join users.role r on s.id_role = r.id",
    (err, result) => {
      if (!err) {
        const formattedRows = result.rows.map((row) => ({
          ...row,
          tanggal_lahir: new Date(row.tanggal_lahir)
            .toISOString()
            .split("T")[0],
        }));

        response.status(200).send(formattedRows);
      } else {
        console.error(err);
      }
    }
  );
});

app.get("/:id_sekolah", (request, response) => {
  const { id_sekolah } = request.params;
  client.query(
    "SELECT s.id, s.id_sekolah, s.id_kelas, s.nis, s.nama, s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.alamat, s.tahun_masuk, s.no_ortu, s.no_hp, s.password, sc.nama_sekolah, k.nama_kelas, r.name as role FROM siswa.siswa s JOIN master.sekolah sc ON s.id_sekolah = sc.id JOIN kurikulum.kelas k ON s.id_kelas = k.id JOIN users.role r ON s.id_role = r.id WHERE s.id_sekolah = $1",
    [id_sekolah],
    (err, result) => {
      if (!err) {
        const formattedRows = result.rows.map((row) => ({
          ...row,
          tanggal_lahir: new Date(row.tanggal_lahir)
            .toISOString()
            .split("T")[0],
        }));

        response.status(200).send(formattedRows);
      } else {
        console.error(err);
        response.status(500).send("Internal Server Error");
      }
    }
  );
});

app.post("/", upload.none(), async (request, response) => {
  const {
    id_sekolah,
    id_kelas,
    nis,
    nama,
    jenis_kelamin,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    tahun_masuk,
    no_ortu,
    no_hp,
    password,
    id_role,
  } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  client.query(
    "INSERT INTO siswa.siswa (id_sekolah, id_kelas, nis, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, tahun_masuk, no_ortu, no_hp, password, id_role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
    [
      id_sekolah,
      id_kelas,
      nis,
      nama,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      tahun_masuk,
      no_ortu,
      no_hp,
      hashedPassword,
      id_role,
    ],
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

app.put("/:id", upload.none(), async (request, response) => {
  const {
    id_sekolah,
    id_kelas,
    nis,
    nama,
    jenis_kelamin,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    tahun_masuk,
    no_ortu,
    no_hp,
    password,
    id_role,
  } = request.body;
  const { id } = request.params;

  const hashedPassword = await bcrypt.hash(password, 10);

  client.query(
    "update siswa.siswa set id_sekolah = $1, id_kelas = $2, nis = $3, nama = $4, jenis_kelamin = $5, tempat_lahir = $6, tanggal_lahir = $7, alamat = $8, tahun_masuk = $9, no_ortu = $10, no_hp = $11, password = $12, id_role = $13 where id = $14",
    [
      id_sekolah,
      id_kelas,
      nis,
      nama,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      tahun_masuk,
      no_ortu,
      no_hp,
      hashedPassword,
      id_role,
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
  client.query("delete from siswa.siswa where id = $1", [id], (err, result) => {
    if (!err) {
      response.send("delete success");
    } else {
      response.send(err.message);
    }
  });
});

module.exports = app;
