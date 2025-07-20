import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { getTimeUrgencyLevel, getUrgencyColors } from '../utils/timeUrgency';

interface CountdownTimerProps {
  targetDate: number; // Unix timestamp
  label?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label = "Time remaining",
  className = "",
  variant = 'default'
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const calculateTimeLeft = React.useCallback((): TimeLeft => {
    const now = Math.floor(Date.now() / 1000);
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        total: difference,
        days: Math.floor(difference / (24 * 60 * 60)),
        hours: Math.floor((difference % (24 * 60 * 60)) / (60 * 60)),
        minutes: Math.floor((difference % (60 * 60)) / 60),
        seconds: difference % 60
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }, [targetDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Don't render if time has passed
  if (timeLeft.total <= 0) {
    return null;
  }

  // Determine urgency levels for dynamic styling
  const urgencyLevel = getTimeUrgencyLevel(targetDate);
  const urgencyColors = getUrgencyColors(urgencyLevel);

  const getUrgencyStyle = () => {
    switch (urgencyLevel) {
      case 'critical':
        return "border-red-500 text-red-200 bg-red-500/20 animate-pulse shadow-lg shadow-red-500/30";
      case 'veryUrgent':
        return "border-red-400 text-red-300 bg-red-500/10 animate-pulse";
      case 'urgent':
        return "border-orange-400 text-orange-300 bg-orange-500/10";
      case 'moderate':
        return "border-yellow-400 text-yellow-300 bg-yellow-500/10";
      default: // normal
        return "border-blue-400 text-blue-300 bg-blue-500/10";
    }
  };

  const formatTimeUnit = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={`${getUrgencyStyle()} px-3 py-1 text-xs font-medium ${className}`}
      >
        <Clock className="w-3 h-3 mr-1" />
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {formatTimeUnit(timeLeft.hours)}:{formatTimeUnit(timeLeft.minutes)}:{formatTimeUnit(timeLeft.seconds)}
      </Badge>
    );
  }    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Calendar className={`h-4 w-4 ${urgencyColors.text}`} />
          <span className="text-sm text-gray-400">{label}:</span>
        </div>
        
        <div className="flex items-center gap-2">
          {timeLeft.days > 0 && (
            <Badge variant="outline" className={getUrgencyStyle()}>
              <span className="font-mono text-sm">
                {timeLeft.days} day{timeLeft.days !== 1 ? 's' : ''}
              </span>
            </Badge>
          )}
          
          <Badge variant="outline" className={getUrgencyStyle()}>
            <Clock className="w-3 h-3 mr-1" />
            <span className="font-mono text-sm">
              {formatTimeUnit(timeLeft.hours)}:{formatTimeUnit(timeLeft.minutes)}:{formatTimeUnit(timeLeft.seconds)}
            </span>
          </Badge>
          
          {urgencyLevel === 'veryUrgent' || urgencyLevel === 'critical' && (
            <Badge variant="outline" className={`whitespace-nowrap ${
              urgencyLevel === 'critical'
                ? "border-red-500 text-red-200 bg-red-500/30 animate-bounce shadow-lg shadow-red-500/50" 
                : "border-red-400 text-red-300 bg-red-500/20 animate-bounce"
            }`}>
              <span className="text-xs font-bold">
                {urgencyLevel === 'critical' ? "STARTING SOON!" : "URGENT"}
              </span>
            </Badge>
          )}
        </div>
      </div>
    );
};

export default CountdownTimer;
