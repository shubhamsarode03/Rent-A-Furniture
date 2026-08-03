import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '@/utils/constants';

import BrowseFurniturePage from '@/pages/furniture/BrowseFurniturePage';
import FurnitureDetailPage from '@/pages/furniture/FurnitureDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import CartPage from '@/pages/cart/CartPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import PaymentResultPage from '@/pages/checkout/PaymentResultPage';
import MyOrdersPage from '@/pages/orders/MyOrdersPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import MyListingsPage from '@/pages/lender/MyListingsPage';
import AddFurniturePage from '@/pages/lender/AddFurniturePage';
import EditFurniturePage from '@/pages/lender/EditFurniturePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ManageCategoriesPage from '@/pages/admin/ManageCategoriesPage';
import VerifyFurniturePage from '@/pages/admin/VerifyFurniturePage';
import AllOrdersPage from '@/pages/admin/AllOrdersPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route path="/" element={<BrowseFurniturePage />} />
        <Route path="/furniture/:id" element={<FurnitureDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated - RENTER and LENDER */}
        <Route path="/cart" element={<RoleRoute allowedRoles={[ROLES.RENTER, ROLES.LENDER, ROLES.ADMIN]}><CartPage /></RoleRoute>} />
        <Route path="/checkout" element={<RoleRoute allowedRoles={[ROLES.RENTER, ROLES.LENDER, ROLES.ADMIN]}><CheckoutPage /></RoleRoute>} />
        <Route path="/payment/result" element={<RoleRoute allowedRoles={[ROLES.RENTER, ROLES.LENDER, ROLES.ADMIN]}><PaymentResultPage /></RoleRoute>} />
        <Route path="/orders" element={<RoleRoute allowedRoles={[ROLES.RENTER, ROLES.LENDER, ROLES.ADMIN]}><MyOrdersPage /></RoleRoute>} />
        <Route path="/orders/:id" element={<RoleRoute allowedRoles={[ROLES.RENTER, ROLES.LENDER, ROLES.ADMIN]}><OrderDetailPage /></RoleRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Lender */}
        <Route path="/lender/listings" element={<RoleRoute allowedRoles={[ROLES.LENDER]}><MyListingsPage /></RoleRoute>} />
        <Route path="/lender/add" element={<RoleRoute allowedRoles={[ROLES.LENDER]}><AddFurniturePage /></RoleRoute>} />
        <Route path="/lender/edit/:id" element={<RoleRoute allowedRoles={[ROLES.LENDER]}><EditFurniturePage /></RoleRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/categories" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><ManageCategoriesPage /></RoleRoute>} />
        <Route path="/admin/verify" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><VerifyFurniturePage /></RoleRoute>} />
        <Route path="/admin/orders" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AllOrdersPage /></RoleRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
