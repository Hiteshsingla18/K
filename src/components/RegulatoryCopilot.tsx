import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Shield, 
  FileText, 
  Scale, 
  AlertTriangle, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { MineRecord } from '../types';

interface RegulatoryCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMine?: MineRecord | null;
  onNavigateToEvidence?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  statutoryReference?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export default function RegulatoryCopilot({
  isOpen,
  onClose,
  selectedMine,
  onNavigateToEvidence
}: RegulatoryCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Greetings. I am the KhananRakshak AI (K-AI) Regulatory Copilot, trained on the Coal Mines Regulations 2017, MoEFCC Environmental Clearance guidelines, and real-time Sentinel-2 / Cartosat-3 satellite telemetry.\n\nCurrently analyzing active surveillance data for **${selectedMine?.name || 'Rajmahal Open Cast Project'}**. How may I assist your statutory investigation?`,
      timestamp: '11:20 AM',
      statutoryReference: 'DGMS / MoEFCC Surveillance Protocol 2026'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Summarize statutory violations for Rajmahal OCP",
    "What are statutory penalties under MoEFCC Rule 14(b)?",
    "Draft formal 48-hour Show Cause Notice text",
    "Explain Cartosat-3 vs Sentinel-2 delta methodology"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      let statRef = 'Coal Mines Regulations 2017';
      let hasAction = false;

      const lower = query.toLowerCase();

      if (lower.includes('rajmahal') || lower.includes('summarize') || lower.includes('violation')) {
        responseText = `**Rajmahal OCP (Notice SCN-2026-082) Breach Summary:**\n\n1. **Unauthorized Encroachment:** 28.42 Hectares of unpermitted coal winning outside gazetted lease boundary.\n2. **Satellite Verification:** Sentinel-2 multispectral + Cartosat-3 imagery indicates fresh earthmoving and bench advancement into Eastern Buffer Sector.\n3. **Biomass Depletion:** -68% NDVI drop compared to baseline clearances.\n4. **Status:** Show-Cause Notice issued to Eastern Coalfields Limited (48h countdown active).`;
        statRef = 'MoEFCC Reg 14(b) & DGMS Notice SCN-2026-082';
        hasAction = true;
      } else if (lower.includes('rule 14') || lower.includes('penalty') || lower.includes('penalties')) {
        responseText = `**Penalties under MoEFCC Environmental Clearance Rule 14(b) & Section 21 of MMDR Act:**\n\n- **Production Sequestration:** Total seizure of mineral extracted from non-cleared boundary area.\n- **Compound Environmental Compensation:** Calculated at 100% market value of illegally mined coal plus ecological restoration tariff (estimated at ₹42.8 Crore for 28.4 Ha).\n- **Operational Suspension:** Power to withhold coal transport permits (Form-C) until formal remediation plan is approved.`;
        statRef = 'Mines & Minerals (Development & Regulation) Act Sec 21';
      } else if (lower.includes('draft') || lower.includes('show cause') || lower.includes('notice')) {
        responseText = `**Draft Statutory Show-Cause Directive:**\n\n"TO: Chief General Manager, Eastern Coalfields Ltd, Rajmahal Area.\n\nWHEREAS multi-temporal geospatial telemetry by Ministry of Coal confirmed unauthorized excavation across 28.42 Ha coordinates [25.0482° N, 87.3820° E];\nYOU ARE HEREBY DIRECTED to show cause within 48 hours why mining operations in Pit Sector 4 should not be suspended under Regulation 109 of CMR 2017."`;
        statRef = 'Regulation 109, Coal Mines Regulations 2017';
      } else if (lower.includes('methodology') || lower.includes('cartosat') || lower.includes('sentinel')) {
        responseText = `**Geospatial Verification Methodology:**\n\n- **Baseline:** Cartosat-3 stereo-pairs at 0.28m resolution establish statutory gazetted lease polygon boundaries.\n- **Temporal Tracking:** Sentinel-2 10m bands (B4, B8) calculate Normalized Difference Vegetation Index (NDVI) fortnightly.\n- **Surface Deformation:** Sentinel-1 InSAR coherence detects overburden dump displacements down to 3mm precision.`;
        statRef = 'National Remote Sensing Centre (NRSC) Guidelines';
      } else {
        responseText = `Based on current regulatory records for ${selectedMine?.name || 'the specified colliery'}: All spatial telemetry points indicate operational monitoring under Ministry of Coal compliance benchmarks. Automated satellite revisit occurs every 5 days via Sentinel-2.`;
        statRef = 'DGMS National Surveillance Database';
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statutoryReference: statRef,
        actionButton: hasAction && onNavigateToEvidence ? {
          label: 'Open Evidence Chain ENV-082',
          onClick: onNavigateToEvidence
        } : undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#1E40AF] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>Regulatory AI Copilot</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-mono">v3.4</span>
              </div>
              <div className="text-[10px] text-slate-400">DGMS &bull; MoEFCC &bull; Spatial Rule Engine</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Mine Context Indicator */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Active Context: <strong>{selectedMine?.name || 'Rajmahal OCP'}</strong></span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{selectedMine?.id || 'MIN-4492-R'}</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-[#0A192F] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#1E40AF] text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {msg.statutoryReference && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-[#1E40AF]" />
                      {msg.statutoryReference}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-slate-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {msg.actionButton && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        msg.actionButton?.onClick();
                        onClose();
                      }}
                      className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{msg.actionButton.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#0A192F] text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Recommended Regulatory Queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 px-2 py-1 rounded text-left transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about mining regulations, lease breaches, or SCN..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#1E40AF]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="bg-[#1E40AF] hover:bg-blue-800 disabled:opacity-40 text-white p-2 rounded-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-1.5">
            AI grounded in Ministry of Coal statutory acts. Not legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}
