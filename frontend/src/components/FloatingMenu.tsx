import { useEffect, useRef, type ReactNode, type RefObject } from "react";

interface FloatingMenuProps {
  anchorRef: RefObject<HTMLElement> | RefObject<HTMLDivElement> | RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const FloatingMenu = ({ anchorRef, isOpen, onClose, children }: FloatingMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();
  const menuStyle = {
    top: `${rect.bottom + window.scrollY + 8}px`,
    left: `${rect.left + window.scrollX}px`,
  };

  return (
    <div ref={menuRef} className="floating-menu" style={menuStyle}>
      {children}
    </div>
  );
};