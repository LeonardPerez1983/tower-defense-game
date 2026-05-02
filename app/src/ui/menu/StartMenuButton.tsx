/**
 * StartMenuButton - Styled CTA button for start menu
 */

interface StartMenuButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function StartMenuButton({ onClick, children, disabled }: StartMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3 rounded-xl font-bold text-base
        transition-all duration-300
        ${disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 active:scale-95 hover:shadow-lg hover:shadow-cyan-500/50'
        }
      `}
    >
      {children}
    </button>
  );
}
