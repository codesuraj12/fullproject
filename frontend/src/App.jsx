import React, { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (inputValue.trim() === '') return;
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      await fetchTodos();
      setInputValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !todoToUpdate.completed,
          text: todoToUpdate.text,
        }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      await fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      await fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="app-container">
      <div className="todo-wrapper">
        <div className="todo-card">
          <h1 className="app-title">Todo App</h1>

          {error && <div className="error-message">Error: {error}</div>}

          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new todo..."
              className="todo-input"
            />
            <button onClick={addTodo} className="add-button">
              <Plus size={20} />
            </button>
          </div>

          <div className="todo-list">
            {isLoading ? (
              <p className="loading-message">Loading todos...</p>
            ) : todos.length === 0 ? (
              <p className="empty-message">No todos yet. Add one above!</p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`check-button ${todo.completed ? 'checked' : ''}`}
                  >
                    {todo.completed && <Check size={14} />}
                  </button>

                  <span className="todo-text">{todo.text}</span>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {todos.length > 0 && (
            <div className="stats-container">
              <div className="stats">
                <span>Total: {todos.length}</span>
                <span>
                  Completed: {todos.filter((t) => t.completed).length}
                </span>
                <span>
                  Remaining: {todos.filter((t) => !t.completed).length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
