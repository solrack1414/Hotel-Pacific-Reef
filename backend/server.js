const express = require('express'); 
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexión con SQLite
const db = new sqlite3.Database('./backend/database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Conectado a SQLite');
});

// Crear tabla de usuarios
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  email TEXT
)`);

// Crear tabla de reservas
db.run(`CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  fecha TEXT,
  hora TEXT,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)`);

// Rutas básicas
app.get('/usuarios', (req, res) => {
  db.all("SELECT * FROM usuarios", [], (err, rows) => {
    if (err) return res.status(400).json(err);
    res.json(rows);
  });
});

app.post('/usuarios', (req, res) => {
  const { username, password, email } = req.body;
  db.run("INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)",
    [username, password, email],
    function(err) {
      if (err) return res.status(400).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
