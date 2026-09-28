import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home/Home';
import { Products } from '../pages/Products/Products';
import { ProductDetails } from '../pages/ProductDetails/ProductDetails';
import { Sell } from '../pages/Sell/Sell';
import { Wishlist } from '../pages/Wishlist/Wishlist';
import { Profile } from '../pages/Profile/Profile';
import { Messages } from '../pages/Messages/Messages';
import { Login } from '../pages/Login/Login';
import { Signup } from '../pages/Signup/Signup';
<<<<<<< Updated upstream
import { PrivacyPolicy } from '../pages/PrivacyPolicy/PrivacyPolicy';
import { TermsConditions } from '../pages/TermsConditions/TermsConditions';
=======
import { AdminPanel } from '../pages/Admin/AdminPanel';
>>>>>>> Stashed changes
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
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
  );
};
