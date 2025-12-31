import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useSettings } from '../context/SettingsContext';

export default function OrderSuccess({ orderNumber = "MX-2024-005", orderTotal = 404.60, onClose }) {
  const { formatPrice } = useSettings();
  
  const successModal = createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full text-center animate-fade-in relative">
        <div className="mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Order Placed!</h2>
          <p className="text-gray-600 text-sm">Thank you for your purchase</p>
        </div>

        <div className="bg-orange-50 rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Order #</span>
            <span className="font-bold text-gray-900 text-sm">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total</span>
            <span className="font-bold text-orange-500">{formatPrice(orderTotal)}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Confirmation sent to email</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span>Delivery: 3-5 business days</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/orders" className="flex-1" onClick={onClose}>
            <button className="w-full flex items-center justify-center rounded-xl h-10 px-3 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-300 text-sm">
              <span className="material-symbols-outlined mr-1 text-sm">package_2</span>
              Track
            </button>
          </Link>
          <Link to="/products" className="flex-1" onClick={onClose}>
            <button className="w-full flex items-center justify-center rounded-xl h-10 px-3 bg-orange-100 text-orange-600 hover:bg-orange-200 font-medium transition-all duration-300 text-sm">
              <span className="material-symbols-outlined mr-1 text-sm">shopping_bag</span>
              Shop
            </button>
          </Link>
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>,
    document.body
  );

  return successModal;
}