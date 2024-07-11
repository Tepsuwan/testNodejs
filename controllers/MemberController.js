const pool = require("../db");
const jwt = require("jsonwebtoken");
const key = "1234";

module.exports = {
  signIn: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name FROM db_member WHERE username = ? AND password = ?",
        [req.body.username, req.body.password]
      );
      pool.releaseConnection();

      if (rows.length > 0) {
        const row = rows[0];
        const token = jwt.sign(row, key, { expiresIn: "1d" });

        return res.send({ token: token });
      }

      res.status(401).send({ message: "username or password invalid" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  verify: (req, res) => {
    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlN0ZWZhbiBlZGl0cyIsImlhdCI6MTcyMDYwNDEwMSwiZXhwIjoxNzIwNjkwNTAxfQ.DsHVlQ3supMMyAARmTD739gflFEX4FiVWmUqLhVM4xA";
      const paylod = jwt.verify(token, key);

      res.send({ paylod: paylod });
    } catch (error) {
      res.send(500).send({ error: error.message });
    }
  },

  secretApi: (req, res) => {
    res.send({ message: "Hello secretApi" });
  },

  list: async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM db_member WHERE id = ?", [
        2,
      ]);

      pool.releaseConnection();

      res.send({ result: rows });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      for (let i = 0; i < 10000; i++) {
        await pool.query(
          "INSERT INTO db_member(name, point, level) VALUE (?, ?, ?)",
          ["stefan", i, "gold"]
        );
      }
      pool.releaseConnection();
      res.sendd({ message: "success" });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }

    res.send({ message: "success" });
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const name = req.body.name;

      const [result] = await pool.query(
        "UPDATE db_member SET name = ? WHERE id = ?",
        [name, id]
      );

      pool.releaseConnection();

      res.send({
        message: result.changedRows == 1 ? "changed" : "not changed",
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};
