import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PageFallback } from '../components/Loader/PageFallback';

// Lazy-loaded page components for optimal route chunking
const Home = lazy(() => import('../pages/Home/Home').then((m) => ({ default: m.Home })));
const Products = lazy(() => import('../pages/Products/Products').then((m) => ({ default: m.Products })));
const ProductDetails = lazy(() => import('../pages/ProductDetails/ProductDetails').then((m) => ({ default: m.ProductDetails })));
const DealsMap = lazy(() => import('../pages/DealsMap/DealsMap').then((m) => ({ default: m.DealsMap })));
const Sell = lazy(() => import('../pages/Sell/Sell').then((m) => ({ default: m.Sell })));
const Wishlist = lazy(() => import('../pages/Wishlist/Wishlist').then((m) => ({ default: m.Wishlist })));
const Profile = lazy(() => import('../pages/Profile/Profile').then((m) => ({ default: m.Profile })));
const Messages = lazy(() => import('../pages/Messages/Messages').then((m) => ({ default: m.Messages })));
const Login = lazy(() => import('../pages/Login/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('../pages/Signup/Signup').then((m) => ({ default: m.Signup })));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('../pages/TermsConditions/TermsConditions').then((m) => ({ default: m.TermsConditions })));
const AdminPanel = lazy(() => import('../pages/Admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/deals-near-me" element={<DealsMap />} />
        <Route path="/map" element={<Navigate to="/deals-near-me" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ads"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
