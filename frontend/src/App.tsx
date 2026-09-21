import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { Header } from './components/Header/Header';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { Login } from './pages/Login/Login';
import { Signup } from './pages/Signup/Signup';
import { Sell } from './pages/Sell/Sell';
import { closeAuthModal, closePostAdModal } from './store/slices/userSlice';

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

      {/* Global Auth Modal */}
      {isAuthModalOpen && (
        <div
          className="modal-backdrop show active"
          onClick={() => dispatch(closeAuthModal())}
        >
          <div onClick={(e) => e.stopPropagation()}>
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
            <Sell
              isModal={true}
              onClose={() => dispatch(closePostAdModal())}
            />
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
