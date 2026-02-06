import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './booking/BookingProvider';
import LandingPage from './LandingPage';

const BookingLayout = lazy(() => import('./booking/BookingLayout'));
const ServicesPage = lazy(() => import('./booking/pages/ServicesPage'));
const SchedulePage = lazy(() => import('./booking/pages/SchedulePage'));
const ConfirmPage = lazy(() => import('./booking/pages/ConfirmPage'));

// Admin pages
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/DashboardPage'));
const AdminServices = lazy(() => import('./admin/pages/ServicesPage'));
const AdminStaff = lazy(() => import('./admin/pages/StaffPage'));
const AdminAppointments = lazy(() => import('./admin/pages/AppointmentsPage'));
const AdminClients = lazy(() => import('./admin/pages/ClientsPage'));
const AdminBlockedTimes = lazy(() => import('./admin/pages/BlockedTimesPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Booking flow */}
        <Route
          path="/book"
          element={
            <BookingProvider>
              <Suspense fallback={null}>
                <BookingLayout />
              </Suspense>
            </BookingProvider>
          }
        >
          <Route index element={<Suspense fallback={null}><ServicesPage /></Suspense>} />
          <Route path="schedule" element={<Suspense fallback={null}><SchedulePage /></Suspense>} />
          <Route path="confirm" element={<Suspense fallback={null}><ConfirmPage /></Suspense>} />
        </Route>

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
          <Route path="appointments" element={<Suspense fallback={null}><AdminAppointments /></Suspense>} />
          <Route path="services" element={<Suspense fallback={null}><AdminServices /></Suspense>} />
          <Route path="staff" element={<Suspense fallback={null}><AdminStaff /></Suspense>} />
          <Route path="clients" element={<Suspense fallback={null}><AdminClients /></Suspense>} />
          <Route path="blocked-times" element={<Suspense fallback={null}><AdminBlockedTimes /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
