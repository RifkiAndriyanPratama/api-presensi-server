const express = require("express");
const client = require("./conection");
const cors = require("cors");
const app = express();
const path = require("path");
const fs = require("fs");
const authMiddleware = require("./middleware/auth");

const sekolah = require("./routes/sekolah");
const siswa = require("./routes/siswa");
const jenjang = require("./routes/jenjang");
const jam_sekolah = require("./routes/jam_sekolah");
const kelas = require("./routes/kelas");
const rombel = require("./routes/rombel");
const presensi = require("./routes/presensi");
const jadwal = require("./routes/jadwal");
const tahun_ajaran = require("./routes/tahun_ajaran");
const jurusan = require("./routes/jurusan");
const sekolah_kelas = require("./routes/sekolah-kelas");
const sekolah_rombel = require("./routes/sekolah-rombel");
const kelas_jurusan = require("./routes/kelas-jurusan");
const sekolah_kelas_siswa = require("./routes/sekolah-kelas-siswa");
const sekolah_jurusan = require("./routes/sekolah-jurusan");
const user = require("./routes/user");
const login =require("./routes/siswalogin");

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log("server running in port 3000");
});

app.use("/sekolah", authMiddleware, sekolah);
app.use("/siswa", authMiddleware, siswa);
app.use("/jenjang", authMiddleware, jenjang);
app.use("/jam-sekolah",authMiddleware, jam_sekolah);
app.use("/kelas", authMiddleware, kelas);
app.use("/rombel", authMiddleware, rombel);
app.use("/presensi", authMiddleware, presensi);
app.use("/jadwal", authMiddleware, jadwal);
app.use("/tahun-ajaran", authMiddleware, tahun_ajaran);
app.use("/jurusan", authMiddleware, jurusan);
app.use("/sekolah-kelas", authMiddleware, sekolah_kelas);
app.use("/sekolah-rombel", authMiddleware, sekolah_rombel);
app.use("/kelas-jurusan", authMiddleware, kelas_jurusan);
app.use("/sekolah-kelas-siswa", authMiddleware, sekolah_kelas_siswa);
app.use("/sekolah-jurusan", authMiddleware, sekolah_jurusan);
app.use("/user", user);
app.use("/login", login);

app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});
