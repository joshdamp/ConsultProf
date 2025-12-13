import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app/Auth/AuthContext';
import { QueryProvider } from './app/providers/QueryProvider';
import { Toaster } from './app/components/ui/toaster';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LoadingSpinner } from './app/components/ui/loading';

// Lazy load pages for better performance
const ProfessorDashboard = lazy(() => import('./features/professor/pages/ProfessorDashboard'));
const ProfessorSchedule = lazy(() => import('./features/professor/pages/ProfessorSchedule'));
const ProfessorRequests = lazy(() => import('./features/professor/pages/ProfessorRequests'));
const ProfessorBookings = lazy(() => import('./features/professor/pages/ProfessorBookings'));
const ProfessorProfile = lazy(() => import('./features/professor/pages/ProfessorProfile'));

const StudentDashboard = lazy(() => import('./features/student/pages/StudentDashboard'));
const StudentProfessors = lazy(() => import('./features/student/pages/StudentProfessors'));
const StudentProfessorDetail = lazy(() => import('./features/student/pages/StudentProfessorDetail'));
const StudentBookingPage = lazy(() => import('./features/student/pages/StudentBookingPage'));
const StudentBookings = lazy(() => import('./features/student/pages/StudentBookings'));
const StudentProfile = lazy(() => import('./features/student/pages/StudentProfile'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size={48} />
  </div>
);

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
                <Route path="/professor/profile" element={<ProfessorProfile />} />
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/professors" element={<StudentProfessors />} />
                <Route path="/student/professors/:id" element={<StudentProfessorDetail />} />
                <Route path="/student/professors/:id/book" element={<StudentBookingPage />} />
                <Route path="/student/bookings" element={<StudentBookings />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
