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
    "select u.id, u.username, u.email, u.password, r.name as role, s.nama_sekolah from users.user u join users.role r on u.id_role = r.id join master.sekolah s on u.id_sekolah = s.id where u.id_sekolah = $1",
    [request.user.id_sekolah],
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

app.post("/register", upload.none(), async (request, response) => {
  const { username, email, password, id_sekolah, id_role } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  client.query(
    "INSERT INTO users.user (username, email, password, id_sekolah, id_role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [username, email, hashedPassword, id_sekolah, id_role],
    (err, result) => {
      if (!err) {
        // Create JWT token
        const token = jwt.sign(
          {
            userId: result.rows[0].id,
            email: result.rows[0].email,
          },
          "logintoken",
          { expiresIn: "24h" }
        );

        response.status(201).json({
          success: true,
          data: {
            userId: result.rows[0].id,
            email: result.rows[0].email,
            token: token,
          },
        });
      } else {
        response.status(500).send(err.message);
      }
    }
  );
});

app.post("/login", upload.none(), async (request, response) => {
  const { email, password } = request.body;

  console.log(request);

  // Periksa apakah pengguna ada
  client.query(
    "SELECT * FROM users.user u join users.role r on u.id_role = r.id WHERE u.email = $1",
    [email],
    async (err, result) => {
      if (err) {
        return response.status(500).send(err.message);
      }

      if (result.rows.length === 0) {
        return response
          .status(401)
          .json({ message: "Email atau password salah" });
      }

      const user = result.rows[0];

      // Bandingkan password yang di-hash
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response
          .status(401)
          .json({ message: "Email atau password salah" });
      }

      // Buat token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        "logintoken",
        { expiresIn: "24h" }
      );

      response.status(200).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.name,
          token: token,
        },
      });
    }
  );
});

module.exports = app;
