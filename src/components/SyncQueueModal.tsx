import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Database, 
  ArrowUpRight, 
  Trash2,
  Layers,
  KeyRound
} from 'lucide-react';
import { OfflineMutation } from '../types';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  mutations: OfflineMutation[];
  onTriggerSync: () => void;
  onClearSynced: () => void;
}

export default function SyncQueueModal({
  isOpen,
  onClose,
  isOnline,
  isSyncing,
  mutations,
  onTriggerSync,
  onClearSynced
}: SyncQueueModalProps) {
  if (!isOpen) return null;

  const pendingCount = mutations.filter(m => m.status === 'pending').length;
  const syncedCount = mutations.filter(m => m.status === 'synced').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-[#DDD8CF]">
        {/* Header */}
        <div className="p-4 bg-[#1A2810] text-[#F4F1EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Offline-First Local Mutation Queue
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isOnline 
                    ? 'bg-emerald-400 text-[#1A2810] font-bold' 
                    : 'bg-amber-400 text-[#1A2810] font-bold'
                }`}>
                  {isOnline ? 'Central Server Connected' : 'Field Offline Simulation'}
                </span>
              </div>
              <p className="text-xs text-[#A8C4B0]">
                Idempotent transactions logged locally with UUID when operating in subterranean/remote pits.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#A8C4B0] hover:text-[#F4F1EB] transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        {/* Sync Status Banner */}
        <div className="p-3.5 bg-[#FAF8F4] border-b border-[#DDD8CF] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Sync: <strong>{pendingCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Synced: <strong>{syncedCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncedCount > 0 && (
              <button
                onClick={onClearSynced}
                className="px-2.5 py-1 text-[11px] text-[#5C6B57] hover:text-[#1A2810] border border-[#DDD8CF] rounded hover:bg-[#EDE9E2] flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear synced logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Synced</span>
              </button>
            )}
            <button
              onClick={onTriggerSync}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                !isOnline
                  ? 'bg-[#EDE9E2] text-[#8FA08A] cursor-not-allowed border border-[#DDD8CF]'
                  : isSyncing
                  ? 'bg-[#2A5C45] text-white animate-pulse'
                  : pendingCount === 0
                  ? 'bg-[#FAF8F4] text-[#8FA08A] border border-[#DDD8CF] cursor-default'
                  : 'bg-[#2A5C45] hover:bg-[#1E3A2F] text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Queue...' : 'Force Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Syncing Progress Visualizer */}
        {isSyncing && (
          <div className="p-3 bg-[#A8C4B0]/20 border-b border-[#A8C4B0] flex items-center gap-3 text-xs text-[#1A2810] animate-pulse">
            <RefreshCw className="w-4 h-4 text-[#2A5C45] animate-spin shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Uploading Queued Mutations with Idempotency Key...</span>
              <p className="text-[11px] text-[#5C6B57]">Verifying SHA-256 signatures with Ministry Central Registry.</p>
            </div>
          </div>
        )}
 
        {/* Queue Items List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-2.5">
          {mutations.length === 0 ? (
            <div className="py-12 text-center text-[#8FA08A] space-y-2">
              <Database className="w-10 h-10 mx-auto text-[#A8C4B0] stroke-1" />
              <div className="text-sm font-semibold text-[#5C6B57]">Local Mutation Queue is Empty</div>
              <p className="text-xs max-w-sm mx-auto text-[#8FA08A]">
                Actions performed in the Labour or Mine Officer portals while in Offline Simulation will generate local UUID records here.
              </p>
            </div>
          ) : (
            mutations.map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border text-xs transition-all ${
                  item.status === 'pending'
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-white border-[#DDD8CF]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1A2810] text-xs">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FAF8F4] text-[#5C6B57] border border-[#DDD8CF]">
                        {item.origin === 'labour_app' ? 'Labour Mobile App' : 'Mine Safety Officer'}
                      </span>
                      <span className="text-[10px] text-[#8FA08A]">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[#5C6B57] text-[11px]">
                      {item.payloadSummary}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-[#8FA08A] font-mono flex-wrap">
                      <span>Local UUID: <strong className="text-[#5C6B57]">{item.id}</strong></span>
                      <span>&bull;</span>
                      <span>Idempotency Key: <strong className="text-[#5C6B57]">{item.idempotencyKey.slice(0, 16)}...</strong></span>
                      {item.serverRecordId && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-bold">Gov Ref: {item.serverRecordId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>⏳ Pending Sync</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ Synced to Central Server</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#FAF8F4] border-t border-[#DDD8CF] text-[11px] text-[#5C6B57] flex items-center justify-between">
          <span>Regulation 109 &bull; Digital Mine Shift Logs (Subterranean Compliant)</span>
          <span className="font-mono text-[10px] text-[#8FA08A]">Storage: In-Memory / Local Storage Queue</span>
        </div>
      </div>
    </div>
  );
}
