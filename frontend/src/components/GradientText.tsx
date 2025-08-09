import React from "react";
import { cn } from "../utils/cn";

const GradientText: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => (
  <span
    className={cn(
      `bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`,
      className
    )}
  >
    {text}
  </span>
);

export default GradientText;
