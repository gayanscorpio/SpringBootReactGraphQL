import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentPage from './components/StudentPage';  // your main app after login
import PrivateRoute from './components/PrivateRoute';
import StudentBooks from './components/StudentBooks';


function App() {

    return (
        <Router>
            <Routes>

                {/* Login route */}
                <Route path="/login" element={<Login />} />

                {/* Student list page */}
                <Route
                    path="/students"
                    element={
                        <PrivateRoute>
                            <StudentPage />
                        </PrivateRoute>
                    }
                />

                {/* Books borrowed by specific student */}
                <Route
                    path="/students/:id/books"
                    element={
                        <PrivateRoute>
                            <StudentBooks />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
