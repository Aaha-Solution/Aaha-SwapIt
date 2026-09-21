import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { quickDemoLogin, logout, loginSuccess, loginStart, loginFailure } from '../store/slices/authSlice';
import { openAuthModal, closeAuthModal } from '../store/slices/userSlice';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const { isAuthModalOpen, authModalTab } = useSelector((state: RootState) => state.user);

  const handleQuickDemoLogin = () => {
    dispatch(quickDemoLogin());
    dispatch(closeAuthModal());
  };

  const handleLogin = async (credentials: { emailOrPhone: string; password: string }) => {
    dispatch(loginStart());
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        dispatch(loginSuccess(res.data));
        dispatch(closeAuthModal());
        return { success: true };
      }
      dispatch(loginFailure(res.message || 'Login failed'));
      return { success: false, error: res.message };
    } catch {
      dispatch(loginFailure('An error occurred during login'));
      return { success: false, error: 'Login error' };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAuthModalOpen,
    authModalTab,
    openLoginModal: () => dispatch(openAuthModal('login')),
    openSignupModal: () => dispatch(openAuthModal('signup')),
    closeAuthModal: () => dispatch(closeAuthModal()),
    quickDemoLogin: handleQuickDemoLogin,
    login: handleLogin,
    logout: handleLogout,
  };
}
