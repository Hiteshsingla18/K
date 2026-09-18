import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export default function KhananRakshakLogo({ className = "w-10 h-10", size, showText = false }: LogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
      <div 
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={style}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Circular Gradient */}
            <radialGradient id="coinGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B1523" />
              <stop offset="85%" stopColor="#040810" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Rim Gradients */}
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="35%" stopColor="#0EA5E9" />
              <stop offset="65%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Circuit Blue Gradient */}
            <linearGradient id="circuitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#0070F3" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Lower Arm Gradient */}
            <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="50%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>

            {/* Bevel Chrome Gradients */}
            <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Cyan Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Clip path for Stem */}
            <clipPath id="stemClip">
              <rect x="135" y="85" width="85" height="320" rx="4" />
            </clipPath>

            {/* Clip path for Upper Arm */}
            <clipPath id="upperArmClip">
              <polygon points="216,192 312,92 390,92 216,270" />
            </clipPath>

            {/* Clip path for Lower Arm */}
            <clipPath id="lowerArmClip">
              <polygon points="216,230 380,395 320,405 216,300" />
            </clipPath>
          </defs>

          {/* 1. Base Coin Disc */}
          <circle cx="250" cy="250" r="235" fill="url(#coinGrad)" />

          {/* 2. Outer Rim Ring with Glow */}
          <circle
            cx="250"
            cy="250"
            r="228"
            fill="none"
            stroke="url(#rimGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Glowing Arc Highlights on Ring */}
          <path
            d="M 330 65 A 228 228 0 0 1 475 270"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="11"
            filter="url(#cyanGlow)"
            strokeLinecap="round"
          />
          <path
            d="M 470 290 A 228 228 0 0 1 310 472"
            fill="none"
            stroke="#10B981"
            strokeWidth="11"
            filter="url(#cyanGlow)"
            strokeLinecap="round"
          />

          {/* 3. Left Metallic Orbital Crescent */}
          <path
            d="M 60 325 C 90 280 135 240 180 340 C 130 330 90 345 60 325 Z"
            fill="url(#chromeBevel)"
            opacity="0.8"
          />

          {/* 4. Right Glowing Orbital Planetary Rings */}
          <path
            d="M 215 270 C 310 180 430 180 440 250 C 450 330 320 420 215 425"
            fill="none"
            stroke="#00D2FF"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#cyanGlow)"
          />
          <path
            d="M 225 282 C 320 200 420 200 428 260 C 435 325 325 395 240 435"
            fill="none"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#cyanGlow)"
          />

          {/* 5. THE LETTER 'K' */}

          {/* --- A. STEM: Grayscale Opencast Coal Mining --- */}
          <g>
            {/* Bevel Shadow/Border */}
            <rect x="130" y="80" width="95" height="330" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
            <rect x="135" y="85" width="85" height="320" rx="4" fill="#0F172A" />

            {/* Clipped Mining Scenery */}
            <g clipPath="url(#stemClip)">
              {/* Sky with Sun */}
              <rect x="135" y="85" width="85" height="80" fill="#E2E8F0" />
              <circle cx="185" cy="130" r="18" fill="#F8FAFC" />

              {/* Mine Terraced Benches (Grayscale) */}
              <polygon points="135,145 220,135 220,165 135,175" fill="#94A3B8" />
              <polygon points="135,170 220,158 220,190 135,200" fill="#64748B" />
              <polygon points="135,195 220,185 220,225 135,235" fill="#475569" />

              {/* Haul Road Curve */}
              <path
                d="M 140 160 Q 185 190 160 230 Q 140 270 200 290"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="7"
                strokeDasharray="4 2"
              />

              {/* Haul Truck 1 (Middle) */}
              <g transform="translate(150, 230) scale(0.65)">
                {/* Truck Body */}
                <rect x="0" y="10" width="35" height="20" rx="3" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
                {/* Dump Bed with Coal */}
                <polygon points="5,10 32,10 36,0 2,0" fill="#000000" />
                <path d="M 4 0 Q 18 -8 34 0" fill="#1E293B" />
                {/* Wheels */}
                <circle cx="8" cy="30" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="28" cy="30" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
                {/* Headlight */}
                <circle cx="34" cy="20" r="2" fill="#FDE047" />
              </g>

              {/* Excavator Shovel at Base (Digging Pit) */}
              <g transform="translate(142, 305) scale(0.7)">
                {/* Tracks */}
                <rect x="5" y="60" width="45" height="14" rx="4" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
                {/* Cabin */}
                <rect x="8" y="38" width="28" height="22" rx="3" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
                {/* Boom Arm */}
                <line x1="28" y1="42" x2="60" y2="15" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
                <line x1="60" y1="15" x2="72" y2="40" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                {/* Shovel Bucket */}
                <path d="M 68 38 L 84 45 L 80 58 L 65 52 Z" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
                {/* Coal Pile */}
                <ellipse cx="78" cy="65" rx="16" ry="7" fill="#000000" />
              </g>
            </g>

            {/* Chrome Frame Highlights on Stem */}
            <rect x="135" y="85" width="4" height="320" fill="#F8FAFC" opacity="0.6" />
            <rect x="216" y="85" width="4" height="320" fill="#0F172A" opacity="0.8" />
          </g>

          {/* --- B. UPPER ARM: Cyber Circuit Board (Blue/Cyan) --- */}
          <g>
            {/* Upper Arm Background Polygon with Bevel */}
            <polygon
              points="216,192 312,92 390,92 216,270"
              fill="url(#circuitGrad)"
              stroke="#60A5FA"
              strokeWidth="4"
            />

            {/* Inner Circuit Details */}
            <g clipPath="url(#upperArmClip)">
              {/* Glowing Traces */}
              <path
                d="M 220 230 L 260 190 L 320 190 L 350 160 L 380 160"
                fill="none"
                stroke="#67E8F9"
                strokeWidth="4"
                filter="url(#cyanGlow)"
              />
              <path
                d="M 235 255 L 280 210 L 330 210 L 360 180"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3.5"
              />
              <path
                d="M 255 170 L 290 135 L 340 135 L 365 110"
                fill="none"
                stroke="#A5F3FC"
                strokeWidth="3"
              />

              {/* Circuit Nodes (Dots) */}
              <circle cx="260" cy="190" r="5" fill="#FFFFFF" filter="url(#cyanGlow)" />
              <circle cx="350" cy="160" r="5" fill="#FFFFFF" filter="url(#cyanGlow)" />
              <circle cx="380" cy="160" r="6" fill="#00E5FF" />
              <circle cx="330" cy="210" r="4.5" fill="#FFFFFF" />
              <circle cx="290" cy="135" r="4.5" fill="#67E8F9" />
              <circle cx="365" cy="110" r="5.5" fill="#FFFFFF" filter="url(#cyanGlow)" />
            </g>

            {/* Outer Bevel Edge */}
            <polygon
              points="216,192 312,92 390,92"
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="3"
            />
          </g>

          {/* --- C. LOWER ARM: Satellite & Green Geo-Boundary --- */}
          <g>
            {/* Lower Arm Base Polygon */}
            <polygon
              points="216,230 380,395 320,405 216,300"
              fill="url(#earthGrad)"
              stroke="#34D399"
              strokeWidth="4"
            />

            {/* Clipped Satellite & Remote Sensing Scene */}
            <g clipPath="url(#lowerArmClip)">
              {/* Forest Canopy Background texture */}
              <rect x="200" y="220" width="200" height="200" fill="#064E3B" />
              <circle cx="280" cy="310" r="45" fill="#047857" opacity="0.6" />
              <circle cx="340" cy="360" r="55" fill="#065F46" opacity="0.7" />

              {/* Open Pit Excavation Cutout */}
              <path
                d="M 290 330 Q 330 310 360 340 Q 350 380 310 375 Z"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="2"
              />

              {/* Glowing Green Geofence Compliance Boundary Line */}
              <path
                d="M 265 310 Q 310 280 365 315 Q 370 385 305 390 Z"
                fill="none"
                stroke="#00FF66"
                strokeWidth="4"
                filter="url(#cyanGlow)"
              />

              {/* Satellite Transmission Waves (Cyan Beams) */}
              <path
                d="M 260 270 A 20 20 0 0 1 275 285"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="3"
                filter="url(#cyanGlow)"
              />
              <path
                d="M 255 262 A 32 32 0 0 1 280 290"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <path
                d="M 248 255 A 44 44 0 0 1 286 296"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2"
                opacity="0.6"
              />

              {/* White Satellite (Communication/Cartosat) */}
              <g transform="translate(290, 260) rotate(-40) scale(0.9)">
                {/* Left Solar Panel */}
                <rect x="-32" y="-7" width="22" height="14" rx="2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="-21" y1="-7" x2="-21" y2="7" stroke="#E2E8F0" strokeWidth="1" />
                {/* Right Solar Panel */}
                <rect x="10" y="-7" width="22" height="14" rx="2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="21" y1="-7" x2="21" y2="7" stroke="#E2E8F0" strokeWidth="1" />
                {/* Satellite Body (Gold/White) */}
                <rect x="-8" y="-9" width="16" height="18" rx="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
                {/* Dish Antenna */}
                <path d="M -5 -9 Q 0 -16 5 -9 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
                <line x1="0" y1="-12" x2="0" y2="-18" stroke="#00E5FF" strokeWidth="2" />
              </g>
            </g>
          </g>

          {/* Central Connecting Hub Highlight */}
          <circle cx="216" cy="248" r="8" fill="#E2E8F0" stroke="#00D2FF" strokeWidth="2" filter="url(#cyanGlow)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">KhananRakshak AI</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-cyan-500/40">
              K-AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-tight">
            AI Smart Coal Surveillance &bull; SIH26024
          </span>
        </div>
      )}
    </div>
  );
}
