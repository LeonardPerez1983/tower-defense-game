/**
 * FactionIcons - Inline SVG icons for factions
 *
 * Simple, bold silhouette-style icons that read well at small sizes.
 */

interface IconProps {
  className?: string;
}

export function TerranIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Angular military tech emblem */}
      <path
        d="M32 8L48 20V36L32 48L16 36V20L32 8Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M32 8L48 20V36L32 48L16 36V20L32 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path
        d="M32 16L40 24V32L32 40L24 32V24L32 16Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle cx="32" cy="28" r="4" fill="currentColor" />
    </svg>
  );
}

export function ProtossIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Elegant golden crest / crystal motif */}
      <path
        d="M32 8L44 24L48 40L32 52L16 40L20 24L32 8Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M32 8L44 24L48 40L32 52L16 40L20 24L32 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 16L38 28L32 44L26 28L32 16Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle cx="32" cy="28" r="3" fill="currentColor" />
      <circle cx="26" cy="36" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="38" cy="36" r="2" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}

export function ZergIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Organic spiral / swarm motif */}
      <ellipse cx="32" cy="32" rx="20" ry="24" fill="currentColor" fillOpacity="0.2" />
      <path
        d="M32 8C36 8 40 12 40 18C40 24 36 28 32 32C28 28 24 24 24 18C24 12 28 8 32 8Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M32 32C36 36 40 40 40 46C40 52 36 56 32 56C28 56 24 52 24 46C24 40 28 36 32 32Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <ellipse cx="32" cy="32" rx="20" ry="24" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 24C24 20 28 18 32 18C36 18 40 20 44 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 40C24 44 28 46 32 46C36 46 40 44 44 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}

export function WorkerIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simple worker/person icon */}
      <circle cx="12" cy="6" r="3" fill="currentColor" />
      <path
        d="M12 10L8 14V20H16V14L12 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EnergyIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lightning bolt */}
      <path
        d="M13 2L3 14H11L10 22L20 10H12L13 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
