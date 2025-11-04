import React from 'react';
import { useZodiac } from '../context/ZodiacContext';

interface ZodiacChartProps {
  isPlaceholder?: boolean;
}

const ZodiacChart: React.FC<ZodiacChartProps> = ({ isPlaceholder = false }) => {
  const { result } = useZodiac();
  
  // Drawing the chart with HTML/CSS for simplicity
  // In a production app, you might use Canvas or SVG for a more detailed chart
  
  return (
    <div className={`aspect-square relative ${isPlaceholder ? 'opacity-30' : ''}`}>
      {/* Outer circle */}
      <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full"></div>
      
      {/* Inner circle */}
      <div className="absolute inset-[15%] border border-purple-400/40 rounded-full"></div>
      
      {/* Center point */}
      <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-amber-300 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* House dividers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute top-1/2 left-1/2 h-[50%] w-[1px] bg-purple-500/40 origin-bottom"
          style={{ transform: `rotate(${i * 30}deg) translateY(-100%)` }}
        ></div>
      ))}
      
      {/* House numbers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const radians = (angle - 90) * (Math.PI / 180);
        const x = 50 + 42 * Math.cos(radians);
        const y = 50 + 42 * Math.sin(radians);
        
        return (
          <div 
            key={i} 
            className={`absolute w-6 h-6 flex items-center justify-center rounded-full text-xs ${
              isPlaceholder ? 'bg-purple-800/20 text-purple-200/40' : 'bg-purple-800/60 text-purple-200'
            }`}
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {i + 1}
          </div>
        );
      })}
      
      {/* Zodiac symbols around the chart */}
      {!isPlaceholder && result && Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 + 15;
        const radians = (angle - 90) * (Math.PI / 180);
        const x = 50 + 47 * Math.cos(radians);
        const y = 50 + 47 * Math.sin(radians);
        
        const zodiacSigns = [
          "♈", "♉", "♊", "♋", "♌", "♍", 
          "♎", "♏", "♐", "♑", "♒", "♓"
        ];
        
        return (
          <div 
            key={i} 
            className="absolute text-amber-200 text-sm"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {zodiacSigns[i]}
          </div>
        );
      })}
      
      {/* Planet positions */}
      {!isPlaceholder && result && Object.entries(result.planets).map(([planet, data]: [string, any], index) => {
        const housePosition = data.house - 1;
        const angleOffset = (data.degree / 30) * 30; // Position within the house
        const angle = housePosition * 30 + angleOffset;
        const radians = (angle - 90) * (Math.PI / 180);
        
        // Vary the distance from center to avoid overlapping
        const distance = 30 + (index % 3) * 5;
        const x = 50 + distance * Math.cos(radians);
        const y = 50 + distance * Math.sin(radians);
        
        const planetSymbols: Record<string, string> = {
          sun: "☉",
          moon: "☽",
          mercury: "☿",
          venus: "♀",
          mars: "♂",
          jupiter: "♃",
          saturn: "♄",
          rahu: "☊",
          ketu: "☋"
        };
        
        return (
          <div 
            key={planet} 
            className="absolute flex items-center justify-center w-5 h-5 bg-indigo-900/70 rounded-full border border-purple-500/50 text-xs font-bold"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)',
              color: planet === 'sun' ? '#FCD34D' : 
                    planet === 'moon' ? '#BFDBFE' : 
                    planet === 'mars' ? '#FCA5A5' : 
                    planet === 'venus' ? '#FDA4AF' : 
                    '#D8B4FE'
            }}
            title={`${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${data.sign} (${data.degree.toFixed(1)}°)`}
          >
            {planetSymbols[planet] || planet.charAt(0).toUpperCase()}
          </div>
        );
      })}
      
      {/* Ascendant marker */}
      {!isPlaceholder && result && (
        <div className="absolute left-0 top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2">
          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-amber-400"></div>
        </div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute inset-[30%] border border-purple-400/20 rounded-full animate-pulse duration-4000"></div>
      
      {isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="text-7xl text-purple-300">♈♉♊</div>
        </div>
      )}
    </div>
  );
};

export default ZodiacChart;