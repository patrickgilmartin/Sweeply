import { useEffect } from 'react';

interface UseKeyboardProps {
  onKeep: () => void;
  onReject: () => void;
}

export const useKeyboard = ({ onKeep, onReject }: UseKeyboardProps): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'k':
        case 'K':
          event.preventDefault();
          onKeep();
          break;
        case 'ArrowLeft':
        case 'r':
        case 'R':
          event.preventDefault();
          onReject();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeep, onReject]);
};
