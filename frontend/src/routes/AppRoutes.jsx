import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy loading pages (stubs for now, we'll create standard imports to ensure it compiles first)
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ExplorePage from '../pages/ExplorePage';
import EventDetailPage from '../pages/EventDetailPage';
import CreateEventPage from '../pages/CreateEventPage';
import EditEventPage from '../pages/EditEventPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="event/:id" element={<EventDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Dashboard Routes with unique layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}
          >
            <Route path="manage/events/create" element={<CreateEventPage />} />
            <Route path="manage/events/edit/:id" element={<EditEventPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
