const express = require("express");
const app = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

app.post("/", upload.none(), async (request, response) => {
  const { nis, password } = request.body;

  console.log(request);

  // Periksa apakah siswa ada
  client.query(
    "SELECT * FROM siswa.siswa s join users.role r on s.id_role = r.id WHERE nis = $1",
    [nis],
    async (err, result) => {
      if (err) {
        return response.status(500).send(err.message);
      }

      if (result.rows.length === 0) {
        return response
          .status(401)
          .json({ message: "nis atau password salah" });
      }

      const siswa = result.rows[0];

      // Bandingkan password yang di-hash
      const isMatch = await bcrypt.compare(password, siswa.password);

      if (!isMatch) {
        return response
          .status(401)
          .json({ message: "nis atau password salah" });
      }

      // Buat token JWT
      const token = jwt.sign(
        {
          siswaId: siswa.id,
          nis: siswa.nis,
        },
        "logintoken",
        { expiresIn: "24h" }
      );

      response.status(200).json({
        success: true,
        data: {
          siswaId: siswa.id,
          siswaNama: siswa.nama,
          role: siswa.name,
          nis: siswa.nis,
          token: token,
        },
      });
    }
  );
});
module.exports = app;

