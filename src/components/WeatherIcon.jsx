import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  CloudFog 
} from 'lucide-react';

export function WeatherIcon({ iconName, className = "w-6 h-6", isDay = true }) {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-500`} />;
    case 'SunCloud':
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-500`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-500 animate-pulse`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-300`} />;
    default:
      return isDay 
        ? <Sun className={`${className} text-amber-500`} /> 
        : <Cloud className={`${className} text-slate-400`} />;
  }
}
