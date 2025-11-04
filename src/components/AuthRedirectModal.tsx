import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface AuthRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthRedirectModal({ isOpen, onClose }: AuthRedirectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please sign in or create an account to continue
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                // Show login popup instead of redirecting
                if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
                  (window as any).showLoginPopup();
                }
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                // Show register popup instead of redirecting
                if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
                  (window as any).showRegisterPopup();
                }
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 