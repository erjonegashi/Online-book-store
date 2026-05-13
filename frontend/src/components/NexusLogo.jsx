export default function NexusLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ng" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="9" fill="url(#ng)" />
      <path
        d="M9.5 26.5V9.5L26.5 26.5V9.5"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5"  cy="9.5"  r="1.8" fill="white" fillOpacity="0.7" />
      <circle cx="26.5" cy="9.5"  r="1.8" fill="white" fillOpacity="0.7" />
      <circle cx="9.5"  cy="26.5" r="1.8" fill="white" fillOpacity="0.7" />
      <circle cx="26.5" cy="26.5" r="1.8" fill="white" fillOpacity="0.7" />
    </svg>
  );
}
