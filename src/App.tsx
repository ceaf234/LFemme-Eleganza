import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './booking/BookingProvider';
import LandingPage from './LandingPage';

const BookingLayout = lazy(() => import('./booking/BookingLayout'));
const ServicesPage = lazy(() => import('./booking/pages/ServicesPage'));
const SchedulePage = lazy(() => import('./booking/pages/SchedulePage'));
const ConfirmPage = lazy(() => import('./booking/pages/ConfirmPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
