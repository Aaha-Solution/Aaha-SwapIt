import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, ExternalLink } from 'lucide-react';
import { RootState } from '../../store/store';
import { removeToast, Toast } from '../../store/slices/toastSlice';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const interval = 20; // 20ms update interval
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast, onDismiss]);

  const handleActionClick = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    if (toast.action?.url) {
      navigate(toast.action.url);
    }
    onDismiss(toast.id);
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          barBg: 'bg-emerald-500',
          border: 'border-emerald-200/80',
          badgeBg: 'bg-emerald-50 text-emerald-700',
          shadow: 'shadow-emerald-500/10',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          barBg: 'bg-rose-500',
          border: 'border-rose-200/80',
          badgeBg: 'bg-rose-50 text-rose-700',
          shadow: 'shadow-rose-500/10',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          barBg: 'bg-amber-500',
          border: 'border-amber-200/80',
          badgeBg: 'bg-amber-50 text-amber-700',
          shadow: 'shadow-amber-500/10',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
          barBg: 'bg-indigo-500',
          border: 'border-indigo-200/80',
          badgeBg: 'bg-indigo-50 text-indigo-700',
          shadow: 'shadow-indigo-500/10',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border ${style.border} p-4 shadow-xl ${style.shadow} transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4`}
      style={{ minWidth: '300px', maxWidth: '420px' }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{style.icon}</div>
        <div className="flex-1 pr-2">
          {toast.title && (
            <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            {toast.message}
          </p>

          {toast.action && (
            <button
              type="button"
              onClick={handleActionClick}
              className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-102 active:scale-98 cursor-pointer ${style.badgeBg}`}
            >
              <span>{toast.action.label}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${style.barBg} transition-all ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
};
