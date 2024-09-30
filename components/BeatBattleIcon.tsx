import React from 'react';

interface BeatBattleIconProps {
  className?: string;
}

const BeatBattleIcon: React.FC<BeatBattleIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    {/* React-like Icon Circle */}
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" fill="none" />

    {/* Music Wave / Soundwave Lines */}
    <path
      d="M 10 50 Q 20 20, 30 50 T 50 50 T 70 50 Q 80 80, 90 50"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
   
    {/* Beat Battle Text */}
    <text x="50%" y="90%" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">
      Beat Battle
    </text>
  </svg>
);

export default BeatBattleIcon;