// src/App.js (or src/pages/StudentPage.js depending on your structure)
import React, { useEffect, useState, useCallback } from 'react';
import StudentService from '../services/StudentService';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import StudentSubscription from '../graphql/StudentSubscription';

function StudentPage() {
  const [students, setStudents] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [form, setForm] = useState({ id: null, name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault(); // prevent default link behavior
    localStorage.removeItem('token'); // remove JWT
    navigate('/login'); // redirect to login
  };

  // Memoized handler to add new students from subscription
  const handleNewStudent = useCallback(
    (newStudent) => {
      setStudents((prevStudents) => {
        if (!prevStudents.some((s) => s.id === newStudent.id)) {
          return [newStudent, ...prevStudents];
        }
        return prevStudents;
      });
    },
    []
  );

  useEffect(() => {
    fetchStudents();
  }, [page, nameFilter]);

  const fetchStudents = async () => {
    try {
      const res = await StudentService.getAll(page, 10, 'name,asc', nameFilter);
      setStudents(res.data.content);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await StudentService.update(form.id, form);
        fetchStudents(); // Refresh list after update
      } else {
        const response = await StudentService.create(form);
        const createdStudent = response.data;

        // Optimistically add new student if it matches filter
        if (createdStudent.name.toLowerCase().includes(nameFilter.toLowerCase())) {
          setStudents((prev) => {
            if (!prev.some((s) => s.id === createdStudent.id)) {
              return [createdStudent, ...prev];
            }
            return prev;
          });
        }
        // Subscription will handle other external adds
      }
      setForm({ id: null, name: '', email: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setForm(student);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await StudentService.remove(id);
        fetchStudents();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  function isAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded?.role === 'ADMIN';
    } catch {
      return false;
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Student Manager</h1>
        <a
          href="/logout"
          onClick={handleLogout}
          style={{ textDecoration: 'underline', color: 'blue' }}
        >
          Logout
        </a>
      </div>

      <input
        type="text"
        placeholder="Filter by name"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <button type="submit">{isEditing ? 'Update' : 'Add'} Student</button>
      </form>

      {/* Subscription component to handle real-time updates */}
      <StudentSubscription onNewStudent={handleNewStudent} nameFilter={nameFilter} />

      <table border="1" cellPadding="5" style={{ marginTop: '20px', width: '50%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {isAdmin() && <th>Actions (Admin)</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              {isAdmin() && (
                <td>
                  <button onClick={() => handleEdit(s)} style={{ marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ marginRight: '8px' }}>Delete</button>
                  <Link to={`/students/${s.id}/books`} style={{ marginLeft: '8px' }}>
                    View Books
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 0))}>Prev</button>
        <span style={{ margin: '0 10px' }}>Page: {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default StudentPage;
