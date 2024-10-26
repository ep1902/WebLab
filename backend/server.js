const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
dotenv.config();
console.log(process.env.DB_USER);
app.use(
  cors({
    origin: "https://weblabfrontend.onrender.com/",
  })
);
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "weblabosbaza",
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true,
});
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.get("/getTicketCount", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM tickets");
    const count = result.rows[0].count;
    res.json({ count });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getTicketInfo/:uuid", async (req, res) => {
  const { uuid } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [
      uuid,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/createTicket", (req, res) => {
  const header = req.headers;

  const { vatin, firstName, lastName } = req.body;

  if (!vatin || !firstName || !lastName) {
    return res
      .status(400)
      .send(
        "Error: All three elements (vatin, firstName, lastName) are required"
      );
  }

  const jwt = require("jsonwebtoken");
  const jwksClient = require("jwks-rsa");

  const domain = "dev-yu381h2mtpkwtf3f.us.auth0.com";
  const audience = "https://dev-yu381h2mtpkwtf3f.us.auth0.com/api/v2/";

  const client = jwksClient({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
  });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }
  async function insertTicket(elem1, elem2, elem3) {
    try {
      const query =
        "INSERT INTO tickets (vatin, firstName, lastName, createdAt) VALUES ($1, $2, $3, NOW()) RETURNING *";
      const values = [elem1, elem2, elem3];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error("Error inserting ticket:", err.message);
      throw err;
    }
  }
  async function countRowsByVatin(elem1Value) {
    try {
      const query = "SELECT COUNT(*) FROM tickets WHERE vatin = $1";
      const values = [elem1Value];
      const res = await pool.query(query, values);
      const count = res.rows[0].count;
      return count;
    } catch (err) {
      console.error("Error counting rows:", err.message);
      throw err;
    }
  }

  function verifyToken(token) {
    jwt.verify(
      token,
      getKey,
      {
        audience: audience,
        issuer: `https://${domain}/`,
        algorithms: ["RS256"],
      },
      async function (err, decoded) {
        if (err) {
          res.status(400).send("Token is not valid");
        } else {
          const QRCode = require("qrcode");
          const fs = require("fs");

          const counter = await countRowsByVatin(vatin);
          if (counter < 3) {
            newTicket = await insertTicket(vatin, firstName, lastName);
            console.log(newTicket.id);
            const url = `https://weblabfrontend.onrender.com/ticketInfo/details?uuid=${newTicket.id}`;
            console.log(url);
            try {
              const qrcode = await QRCode.toBuffer(url, { type: "png" });
              res.set("Content-Type", "image/png");
              res.send(qrcode);
            } catch (err) {
              console.error("Error generating QR code:", err);
              res.status(500).send("Error generating QR code");
            }
          } else {
            res
              .status(400)
              .send("Error: That OIB already matches three tickets.");
          }
        }
      }
    );
  }

  verifyToken(header.authorization);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
