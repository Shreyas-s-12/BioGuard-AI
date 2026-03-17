import { useEffect } from 'react';
import RiskBadge from './RiskBadge';

function ChemicalModal({ chemical, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!chemical) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl hover:shadow-[0_0_25px_rgba(56,189,248,0.3)] transition animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{chemical.chemical_name}</h2>
            {chemical.e_number && (
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-400 font-mono">
                E{chemical.e_number}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Risk Level */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400">Risk Level</span>
            <RiskBadge level={chemical.risk_level} />
          </div>

          {/* Category */}
          {chemical.category && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Category</h3>
              <p className="text-white">{chemical.category}</p>
            </div>
          )}

          {/* Purpose */}
          {chemical.purpose && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Purpose
              </h3>
              <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10">
                {chemical.purpose}
              </p>
            </div>
          )}

          {/* Health Concerns */}
          {chemical.health_concerns && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Health Concerns
              </h3>
              <p className="text-slate-300 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                {chemical.health_concerns}
              </p>
            </div>
          )}

          {/* Safe Limits */}
          {chemical.safe_limit && (
            <div>
              <h3 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Safe Limits
              </h3>
              <p className="text-slate-300 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                {chemical.safe_limit}
              </p>
            </div>
          )}

          {/* Common Foods */}
          {chemical.common_foods && (
            <div>
              <h3 className="text-sm font-medium text-cyan-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Common Foods Containing It
              </h3>
              <p className="text-slate-300 bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                {chemical.common_foods}
              </p>
            </div>
          )}

          {/* CAS Number */}
          {chemical.cas_number && (
            <div className="flex items-center text-sm text-slate-500">
              <span className="mr-2">CAS Number:</span>
              <span className="font-mono">{chemical.cas_number}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChemicalModal;
