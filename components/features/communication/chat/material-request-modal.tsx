'use client';

import React from 'react';
import { MaterialRequestData } from './types';
import { X, Package, CheckCircle, XCircle, Clock, CalendarBlank, MapPin, User, FileText } from '@phosphor-icons/react';

interface MaterialRequestModalProps {
  request: MaterialRequestData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (newStatus: 'Approved' | 'Rejected') => void;
}

export function MaterialRequestModal({
  request,
  isOpen,
  onClose,
  onStatusChange,
}: MaterialRequestModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 px-6 py-4 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center">
              <Package size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">Material Indent Details</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{request.requestNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Package size={14} className="text-slate-400" /> Material Required
              </span>
              <p className="font-semibold text-slate-800 mt-1">{request.material}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FileText size={14} className="text-slate-400" /> Quantity
              </span>
              <p className="font-semibold text-slate-800 mt-1">{request.quantity}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarBlank size={14} className="text-slate-400" /> Required Date
              </span>
              <p className="font-semibold text-slate-800 mt-1">{request.requiredDate}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={14} className="text-slate-400" /> Est. Material Cost
              </span>
              <p className="font-semibold text-slate-800 mt-1">{request.estimatedCost || '₹22,500'}</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500">Requested By</span>
                <p className="text-sm font-medium text-slate-800">{request.requestedBy}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500">Delivery Site / Location</span>
                <p className="text-sm font-medium text-slate-800">{request.site}</p>
              </div>
            </div>

            {request.notes && (
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 text-xs text-amber-900">
                <strong className="block font-semibold mb-0.5">Supervisor Note:</strong>
                {request.notes}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStatusChange?.('Rejected');
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 flex items-center gap-1.5 transition"
            >
              <XCircle size={15} weight="bold" /> Reject
            </button>
            <button
              onClick={() => {
                onStatusChange?.('Approved');
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle size={15} weight="bold" /> Approve Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
