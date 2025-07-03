

export interface FloatingMenuProps {
  anchorRef: RefObject<HTMLElement> | RefObject<HTMLDivElement> | RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}