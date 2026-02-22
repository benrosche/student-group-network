const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'rooms.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return {}; }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db));
}

// Create room
app.post('/api/room', (req, res) => {
  const db = loadDB();
  const id = crypto.randomUUID().slice(0, 8);
  db[id] = req.body || { people: [], groups: [], memberships: [] };
  saveDB(db);
  res.json({ id });
});

// Get room
app.get('/api/room/:id', (req, res) => {
  const db = loadDB();
  const room = db[req.params.id];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// Update room
app.put('/api/room/:id', (req, res) => {
  const db = loadDB();
  if (!db[req.params.id]) return res.status(404).json({ error: 'Room not found' });
  db[req.params.id] = req.body;
  saveDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
