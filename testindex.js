const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();

const corsOptions = {
  credentials: true,
  origin: "http://localhost:3000",
  // origin: "https://crypto-site-sepia.vercel.app",
};
app.use(cors(corsOptions));

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://default:8dn7YuhUCQVz@ep-odd-mouse-a4qb6f7d.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err);
  process.exit(-1);
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the process with an error code
  } else {
    console.log("Database connection successful");
    release(); // Release the client back to the pool
  }
});

const blacklist = new Set();

// Example route to get all employees (replace with your actual queries)
app.get("/", async (req, res) => {
  res.send("hello");
});

const generateToken = (user) => {
  return jwt.sign({ user }, "your_jwt_secret", { expiresIn: "5m" });
};

const decodeToken = (token) => {
  if (blacklist.has(token)) {
    console.error("Token has been invalidated");
    return null;
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

const invalidateToken = (token) => {
  blacklist.add(token);
};

app.post("/signup", async (req, res) => {
  const { token } = req.body;

  if (token) {
    const decoded = decodeToken(token);

    if (decoded) {
      console.log("Decoded Token:", decoded);
      console.log(decoded?.user.email);
      const hashedPassword = await bcrypt.hash(decoded?.user.password, 10);

      const client = await pool.connect();
      await client.query(
        "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *",
        [decoded?.user.id, decoded?.user.email, hashedPassword]
      );

      client.release();

      console.log("Token invalidated");
      invalidateToken(token);

      res.status(200).json({ message: "verification successful" });
    } else {
      res.status(400).json({ message: "Invalid token" });
    }
  } else {
    console.log("no token");
  }

  // try {
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   const client = await pool.connect();
  //   const result = await client.query(
  //     "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *",
  //     [userId, email, hashedPassword]
  //   );

  //   client.release();
  //   // const token = generateToken(result.rows[0].id);

  //   res.status(201).json({ msg: "User registered successfully" });
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ error: "Sign-up failed" });
  // }
});


app.post("/transactions", async (req, res) => { 
  const { transactionID } = req.body
  console.log(transactionIDgit );
  

})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  // SQL query to check if the email already exists in the table
  const SQL_QUERY = "SELECT * FROM users WHERE email = $1";

  try {
    // Execute the query with the provided email
    const result = await pool.query(SQL_QUERY, [email]);

    // console.log(result);

    // If result.rows has length greater than 0, it means email already exists
    if (result.rows.length > 0) {
      const passwordH = result.rows[0].password;
      const isMatch = await bcrypt.compare(password, passwordH);

      if (isMatch) {
        console.log("login successful");
        res.status(200).json({ message: "exist", id: result.rows[0].id });
      } else {
        console.log("User does not exist!");
        res.status(404).json({ message: "Incorrect password." });
      }
    } else {
      console.log("User does not exist!");
      res.status(404).json({ message: "Incorrect email." });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

app.post("/send-registration-link", async (req, res) => {
  const { email, password } = req.body;
  const userId = uuidv4();

  // SQL query to check if the email already exists in the table
  const SQL_QUERY = "SELECT * FROM users WHERE email = $1";

  try {
    // Execute the query with the provided email
    const result = await pool.query(SQL_QUERY, [email]);

    // If result.rows has length greater than 0, it means email already exists
    if (result.rows.length > 0) {
      res.status(409).json({ sent: false, message: "Email already exists" });
      console.log("exist");
    } else {
      const token = generateToken({ id: userId, email, password });
      console.log("Generated Token:", token);

      // setTimeout(() => {
      //   const decoded = decodeToken(token);
      //   console.log("Decoded Token:", decoded);
      // }, 1000 * 10);
      res.status(200).json({ sent: true, token });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/getDetails", async (req, res) => {
  const { tok } = req.body;
  console.log(tok);

  // SQL query to check if the email already exists in the table
  const SQL_QUERY = "SELECT * FROM users WHERE id = $1";

  try {
    // Execute the query with the provided email
    const result = await pool.query(SQL_QUERY, [tok]);
    if (result.rows.length > 0) {
      res.status(200).json({ userInfo: result.rows[0] });
      console.log("exist");
    } else {
      // const token = generateToken({ id: userId, email, password });
      // console.log("Generated Token:", token);
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(3008, () => {
  console.log("Server ready on port 3008");
});

module.exports = app;
