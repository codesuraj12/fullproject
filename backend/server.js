const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_PREFIX = process.env.API_PREFIX || '/api';

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// In-memory storage (replace with DB later)
let todos = [];
let nextId = 1;

// Routes
app.get(`${API_PREFIX}/todos`, (req, res) => {
  res.json(todos);
});

app.post(`${API_PREFIX}/todos`, (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put(`${API_PREFIX}/todos/:id`, (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (text !== undefined) todos[todoIndex].text = text.trim();
  if (completed !== undefined) todos[todoIndex].completed = completed;
  todos[todoIndex].updatedAt = new Date().toISOString();

  res.json(todos[todoIndex]);
});

app.delete(`${API_PREFIX}/todos/:id`, (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  res.json(deletedTodo);
});

app.get(`${API_PREFIX}/todos/stats`, (req, res) => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const remaining = total - completed;
  res.json({ total, completed, remaining });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo API running at http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
});

module.exports = app;
