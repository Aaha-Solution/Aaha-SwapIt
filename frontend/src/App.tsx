import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { Header } from './components/Header/Header';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { MobileBottomNav } from './components/MobileBottomNav/MobileBottomNav';
import { ToastContainer } from './components/Toast/ToastContainer';
import { AppRoutes } from './routes/AppRoutes';
import { closeAuthModal, closePostAdModal } from './store/slices/userSlice';

// Lazy load modal overlay components so they don't block the initial main bundle
const Login = lazy(() => import('./pages/Login/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup/Signup').then((m) => ({ default: m.Signup })));
const Sell = lazy(() => import('./pages/Sell/Sell').then((m) => ({ default: m.Sell })));

export const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthModalOpen, authModalTab, isPostAdModalOpen } = useSelector(
    (state: RootState) => state.user
  );
  const [modalTab, setModalTab] = useState<'login' | 'signup'>('login');

  // Sync modalTab with Redux authModalTab when opening
  React.useEffect(() => {
    setModalTab(authModalTab);
  }, [authModalTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Global Interactive Toast Notification Host */}
      <ToastContainer />

      {/* Top Sticky Header */}
      <Header />

      {/* Main Page Layout with Left Navigation Sidebar - Exact Prototype Pixels */}
      <div className="main-layout">
        {/* Left Category & Account Sidebar */}
        <Navbar />

        {/* Dynamic Content Views */}
        <main className="app-main-content">
          <AppRoutes />
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modern Floating Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Auth Modal */}
      {isAuthModalOpen && (
        <div
          className="modal-backdrop show active"
          onClick={() => dispatch(closeAuthModal())}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={null}>
              {modalTab === 'login' ? (
                <Login
                  isModal={true}
                  onClose={() => dispatch(closeAuthModal())}
                  onSwitchToSignup={() => setModalTab('signup')}
                />
              ) : (
                <Signup
                  isModal={true}
                  onClose={() => dispatch(closeAuthModal())}
                  onSwitchToLogin={() => setModalTab('login')}
                />
              )}
            </Suspense>
          </div>
        </div>
      )}

      {/* Global Post Ad Modal */}
      {isPostAdModalOpen && (
        <div
          className="modal-backdrop show active"
          onClick={() => dispatch(closePostAdModal())}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={null}>
              <Sell
                isModal={true}
                onClose={() => dispatch(closePostAdModal())}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
