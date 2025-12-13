import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app/Auth/AuthContext';
import { QueryProvider } from './app/providers/QueryProvider';
import { Toaster } from './app/components/ui/toaster';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Professor Pages
import ProfessorDashboard from './features/professor/pages/ProfessorDashboard';
import ProfessorSchedule from './features/professor/pages/ProfessorSchedule';
import ProfessorRequests from './features/professor/pages/ProfessorRequests';
import ProfessorBookings from './features/professor/pages/ProfessorBookings';

// Student Pages
import StudentDashboard from './features/student/pages/StudentDashboard';
import StudentProfessors from './features/student/pages/StudentProfessors';
import StudentProfessorDetail from './features/student/pages/StudentProfessorDetail';
import StudentBookingPage from './features/student/pages/StudentBookingPage';
import StudentBookings from './features/student/pages/StudentBookings';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Professor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['professor']} />}>
              <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
              <Route path="/professor/schedule" element={<ProfessorSchedule />} />
              <Route path="/professor/requests" element={<ProfessorRequests />} />
              <Route path="/professor/bookings" element={<ProfessorBookings />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/professors" element={<StudentProfessors />} />
              <Route path="/student/professors/:id" element={<StudentProfessorDetail />} />
              <Route path="/student/professors/:id/book" element={<StudentBookingPage />} />
              <Route path="/student/bookings" element={<StudentBookings />} />
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
