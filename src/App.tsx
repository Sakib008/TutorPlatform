import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { useAppSelector } from './store/hook';

function useAuth() {
  const { user } = useAppSelector((state) => state.auth);
  return {
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
function DashboardRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
}

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
