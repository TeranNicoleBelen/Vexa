import React from 'react';

// SVG Icons con temática cosmética - reemplazan emojis

export const IconLipstick = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="20" width="12" height="16" rx="2" fill={color} opacity="0.9"/>
    <rect x="12" y="16" width="16" height="6" rx="2" fill={color}/>
    <path d="M16 16 Q20 8 24 16" fill={color} opacity="0.7"/>
    <rect x="15" y="22" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
  </svg>
);

export const IconPerfume = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="18" width="14" height="18" rx="3" fill={color} opacity="0.85"/>
    <rect x="17" y="14" width="6" height="6" rx="1" fill={color}/>
    <rect x="19" y="11" width="2" height="4" rx="1" fill={color} opacity="0.7"/>
    <rect x="16" y="10" width="8" height="2" rx="1" fill={color} opacity="0.6"/>
    <ellipse cx="20" cy="24" rx="4" ry="3" fill="white" opacity="0.15"/>
    <path d="M26 9 Q28 7 27 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    <path d="M30 11 Q32 9 31 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

export const IconMirror = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="16" rx="10" ry="12" fill={color} opacity="0.15" stroke={color} strokeWidth="2"/>
    <ellipse cx="20" cy="16" rx="7" ry="9" fill="white" opacity="0.4"/>
    <rect x="19" y="28" width="2" height="8" rx="1" fill={color}/>
    <rect x="14" y="35" width="12" height="2" rx="1" fill={color} opacity="0.7"/>
    <path d="M14 12 Q16 10 18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none"/>
  </svg>
);

export const IconCream = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="28" rx="12" ry="8" fill={color} opacity="0.85"/>
    <ellipse cx="20" cy="22" rx="10" ry="6" fill={color}/>
    <ellipse cx="20" cy="18" rx="8" ry="3" fill={color} opacity="0.7"/>
    <path d="M14 18 Q20 14 26 18" stroke="white" strokeWidth="1.2" opacity="0.4" fill="none"/>
  </svg>
);

export const IconBrush = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="4" width="4" height="24" rx="2" fill={color} opacity="0.9"/>
    <ellipse cx="20" cy="30" rx="5" ry="6" fill={color}/>
    <ellipse cx="20" cy="34" rx="4" ry="4" fill={color} opacity="0.7"/>
    <rect x="16" y="10" width="8" height="3" rx="1" fill="white" opacity="0.2"/>
  </svg>
);

export const IconFlower = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="5" fill={color}/>
    {[0,60,120,180,240,300].map((angle, i) => (
      <ellipse key={i} cx={20 + 9*Math.cos(angle*Math.PI/180)} cy={20 + 9*Math.sin(angle*Math.PI/180)} rx="4" ry="6" fill={color} opacity="0.6"
        transform={`rotate(${angle}, ${20 + 9*Math.cos(angle*Math.PI/180)}, ${20 + 9*Math.sin(angle*Math.PI/180)})`}/>
    ))}
    <circle cx="20" cy="20" r="3" fill="white" opacity="0.8"/>
  </svg>
);

export const IconStar = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 L23.5 14.5 L35 14.5 L25.7 21.2 L29.2 32 L20 25.4 L10.8 32 L14.3 21.2 L5 14.5 L16.5 14.5 Z" fill={color}/>
  </svg>
);

export const IconTruck = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="14" width="24" height="14" rx="2" fill={color} opacity="0.85"/>
    <path d="M26 18 L34 18 L37 24 L37 28 L26 28 Z" fill={color} opacity="0.7"/>
    <circle cx="10" cy="29" r="4" fill="#1A1A1A" stroke={color} strokeWidth="2"/>
    <circle cx="30" cy="29" r="4" fill="#1A1A1A" stroke={color} strokeWidth="2"/>
    <rect x="6" y="17" width="10" height="7" rx="1" fill="white" opacity="0.15"/>
    <rect x="28" y="19" width="6" height="6" rx="1" fill="white" opacity="0.2"/>
  </svg>
);

export const IconCard = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="32" height="20" rx="3" fill={color} opacity="0.85"/>
    <rect x="4" y="16" width="32" height="5" fill={color} opacity="0.5"/>
    <rect x="8" y="24" width="10" height="2" rx="1" fill="white" opacity="0.6"/>
    <rect x="28" y="24" width="6" height="2" rx="1" fill="white" opacity="0.4"/>
  </svg>
);

export const IconShield = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 L34 10 L34 22 Q34 32 20 37 Q6 32 6 22 L6 10 Z" fill={color} opacity="0.85"/>
    <path d="M14 20 L18 24 L26 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const IconChat = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8 Q6 4 10 4 L30 4 Q34 4 34 8 L34 22 Q34 26 30 26 L22 26 L16 32 L16 26 L10 26 Q6 26 6 22 Z" fill={color} opacity="0.85"/>
    <rect x="12" y="12" width="16" height="2" rx="1" fill="white" opacity="0.6"/>
    <rect x="12" y="17" width="10" height="2" rx="1" fill="white" opacity="0.4"/>
  </svg>
);

export const IconCart = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2 L3 6 L3 20 Q3 21 4 21 L20 21 Q21 21 21 20 L21 6 L18 2 Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M3 10 L21 10" stroke={color} strokeWidth="1.5"/>
    <path d="M8 2 L8 10" stroke={color} strokeWidth="1.5"/>
    <path d="M16 2 L16 10" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const IconPin = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 Q18 2 18 9 Q18 15 12 22 Q6 15 6 9 Q6 2 12 2 Z" fill={color} opacity="0.85"/>
    <circle cx="12" cy="9" r="3" fill="white" opacity="0.8"/>
  </svg>
);

export const IconPhone = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3 Q5 2 7 2 L9 2 L11 7 L9 9 Q10 12 15 15 L17 13 L22 15 L22 17 Q22 19 20 19 Q8 19 5 7 Z" fill={color} opacity="0.85"/>
  </svg>
);

export const IconEmail = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" fill={color} opacity="0.85"/>
    <path d="M2 7 L12 14 L22 7" stroke="white" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const IconClock = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill={color} opacity="0.85"/>
    <path d="M12 7 L12 12 L16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconBox = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7 L12 2 L22 7 L22 17 L12 22 L2 17 Z" fill={color} opacity="0.85"/>
    <path d="M2 7 L12 12 L22 7" stroke="white" strokeWidth="1.2" fill="none"/>
    <path d="M12 12 L12 22" stroke="white" strokeWidth="1.2"/>
  </svg>
);

export const IconAdmin = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill={color} opacity="0.85"/>
    <path d="M4 20 Q4 15 12 15 Q20 15 20 20" fill={color} opacity="0.6"/>
    <circle cx="18" cy="6" r="3" fill={color}/>
    <path d="M16.5 6 L17.5 7 L19.5 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </svg>
);

export const IconStore = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="1" fill={color} opacity="0.85"/>
    <path d="M2 7 L4 11 L20 11 L22 7 L12 3 Z" fill={color} opacity="0.7"/>
    <rect x="9" y="14" width="6" height="8" rx="1" fill="white" opacity="0.3"/>
  </svg>
);

export const IconLogout = ({ size = 24, color = '#e74c3c' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3 L4 3 Q3 3 3 4 L3 20 Q3 21 4 21 L9 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M16 7 L21 12 L16 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M21 12 L9 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconKey = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="5" fill={color} opacity="0.85"/>
    <path d="M13 13 L22 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 19 L18 17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="2" fill="white" opacity="0.6"/>
  </svg>
);

export const IconStar2 = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 L14.5 9 L22 9 L16 13.5 L18.5 21 L12 16.5 L5.5 21 L8 13.5 L2 9 L9.5 9 Z" fill={color}/>
  </svg>
);

export const IconHome = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12 L12 4 L21 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <rect x="5" y="12" width="14" height="9" rx="1" fill={color} opacity="0.85"/>
    <rect x="9" y="15" width="6" height="6" rx="1" fill="white" opacity="0.3"/>
  </svg>
);

export const IconBriefcase = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="20" height="13" rx="2" fill={color} opacity="0.85"/>
    <path d="M8 9 L8 7 Q8 5 10 5 L14 5 Q16 5 16 7 L16 9" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M2 14 L22 14" stroke="white" strokeWidth="1" opacity="0.3"/>
  </svg>
);

export const IconDiamond = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6 L30 16 L20 34 L10 16 Z" fill={color} opacity="0.85"/>
    <path d="M10 16 L30 16" stroke="white" strokeWidth="1.2" opacity="0.4"/>
    <path d="M15 10 L20 6 L25 10" fill={color} opacity="0.5"/>
    <path d="M16 16 L20 34" stroke="white" strokeWidth="0.8" opacity="0.2"/>
  </svg>
);

export const IconTarget = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="15" stroke={color} strokeWidth="2" fill="none" opacity="0.4"/>
    <circle cx="20" cy="20" r="10" stroke={color} strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="20" cy="20" r="5" fill={color} opacity="0.9"/>
    <path d="M20 5 L20 8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 32 L20 35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 20 L8 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 20 L35 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconEye = ({ size = 40, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20 Q12 8 20 8 Q28 8 36 20 Q28 32 20 32 Q12 32 4 20Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2"/>
    <circle cx="20" cy="20" r="6" fill={color} opacity="0.9"/>
    <circle cx="22" cy="18" r="2" fill="white" opacity="0.5"/>
  </svg>
);

export const IconMap = ({ size = 24, color = '#FFB6C1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2 L3 5 L3 22 L9 19 L15 22 L21 19 L21 2 L15 5 Z" fill={color} opacity="0.7"/>
    <path d="M9 2 L9 19" stroke="white" strokeWidth="1" opacity="0.5"/>
    <path d="M15 5 L15 22" stroke="white" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const IconShop = ({ size = 24, color = '#E8637A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5 L6 2 L18 2 L20 5" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M2 5 L4 5 Q4 9 2 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M8 5 Q8 9 12 9 Q16 9 16 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M20 5 Q20 9 22 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <rect x="3" y="9" width="18" height="13" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5"/>
  </svg>
);

