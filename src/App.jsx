import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Hard redirect
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/student"
          element={<StudentDashboard onSignOut={handleSignOut} />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard onSignOut={handleSignOut} />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;