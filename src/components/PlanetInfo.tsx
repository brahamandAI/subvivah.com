import React from 'react';
import { Sun, Moon, Sparkles, Atom, CloudLightning, Ligature as Saturn, Crosshair } from 'lucide-react';

interface PlanetInfoProps {
  planet: string;
  sign: string;
  house: number;
  degree: number;
}

const PlanetInfo: React.FC<PlanetInfoProps> = ({ planet, sign, house, degree }) => {
  const getPlanetIcon = () => {
    switch (planet.toLowerCase()) {
      case 'sun':
        return <Sun size={14} className="text-amber-300" />;
      case 'moon':
        return <Moon size={14} className="text-blue-200" />;
      case 'mercury':
        return <Sparkles size={14} className="text-purple-300" />;
      case 'venus':
        return <Sparkles size={14} className="text-rose-300" />;
      case 'mars':
        return <CloudLightning size={14} className="text-red-400" />;
      case 'jupiter':
        return <Sparkles size={14} className="text-amber-200" />;
      case 'saturn':
        return <Saturn size={14} className="text-gray-300" />;
      case 'rahu':
      case 'ketu':
        return <Crosshair size={14} className="text-indigo-300" />;
      default:
        return <Atom size={14} className="text-purple-300" />;
    }
  };

  return (
    <div className="bg-indigo-800/30 p-2 rounded flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {getPlanetIcon()}
        <span className="capitalize text-purple-200">{planet}</span>
      </div>
      <div className="ml-auto text-right">
        <span className="text-white">{sign}</span>
        <span className="text-purple-300 block text-[10px]">House {house} • {degree.toFixed(1)}°</span>
      </div>
    </div>
  );
};

export default PlanetInfo;