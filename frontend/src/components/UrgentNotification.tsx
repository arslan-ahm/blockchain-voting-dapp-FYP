import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';

interface UrgentNotificationProps {
  message: string;
  timeLeft?: string;
  className?: string;
}

const UrgentNotification: React.FC<UrgentNotificationProps> = ({
  message,
  timeLeft,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-400/50 ${className}`}>
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">{message}</p>
        {timeLeft && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-orange-400" />
            <span className="text-xs text-orange-300 font-mono">{timeLeft}</span>
          </div>
        )}
      </div>
      <Badge variant="outline" className="border-red-400 text-red-300 bg-red-500/20 animate-bounce">
        <span className="text-xs font-bold">URGENT</span>
      </Badge>
    </div>
  );
};

export default UrgentNotification;
