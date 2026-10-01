import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '@isp/shared';
import { useAuth } from './hooks/useAuth';
import RequireRole from './components/RequireRole';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import TechniciansPage from './pages/TechniciansPage';
import SuppliersPage from './pages/SuppliersPage';
import VehiclesPage from './pages/VehiclesPage';
import LocationsPage from './pages/LocationsPage';
import UsersPage from './pages/UsersPage';
import StockPage from './pages/StockPage';
import Layout from './components/Layout';

const STAFF = [Role.ADMIN, Role.ESTOQUISTA];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route
          path="products"
          element={
            <RequireRole allow={STAFF}>
              <ProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="technicians"
          element={
            <RequireRole allow={STAFF}>
              <TechniciansPage />
            </RequireRole>
          }
        />
        <Route
          path="suppliers"
          element={
            <RequireRole allow={STAFF}>
              <SuppliersPage />
            </RequireRole>
          }
        />
        <Route
          path="vehicles"
          element={
            <RequireRole allow={STAFF}>
              <VehiclesPage />
            </RequireRole>
          }
        />
        <Route
          path="locations"
          element={
            <RequireRole allow={STAFF}>
              <LocationsPage />
            </RequireRole>
          }
        />
        <Route
          path="users"
          element={
            <RequireRole allow={[Role.ADMIN]}>
              <UsersPage />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  );
}
