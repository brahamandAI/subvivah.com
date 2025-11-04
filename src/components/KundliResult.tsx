import React, { useRef, useState, useEffect } from 'react';
import { useZodiac } from '../context/ZodiacContext';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sun, 
  Moon, 
  ArrowUp, 
  Share2, 
  Download,
  RefreshCw
} from 'lucide-react';
import PlanetInfo from './PlanetInfo';
import ZodiacChart from './ZodiacChart';
import jsPDF from 'jspdf';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'tr', label: 'Turkish' },
  { code: 'pl', label: 'Polish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'sv', label: 'Swedish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'da', label: 'Danish' },
  { code: 'el', label: 'Greek' },
  { code: 'he', label: 'Hebrew' },
  { code: 'id', label: 'Indonesian' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'cs', label: 'Czech' },
  { code: 'ro', label: 'Romanian' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'hr', label: 'Croatian' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'et', label: 'Estonian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'fa', label: 'Persian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'or', label: 'Odia' },
  { code: 'si', label: 'Sinhala' },
  { code: 'sw', label: 'Swahili' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'st', label: 'Southern Sotho' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'am', label: 'Amharic' },
  { code: 'so', label: 'Somali' },
  { code: 'ne', label: 'Nepali' },
  { code: 'my', label: 'Burmese' },
  { code: 'km', label: 'Khmer' },
  { code: 'lo', label: 'Lao' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'hy', label: 'Armenian' },
  { code: 'ka', label: 'Georgian' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'ky', label: 'Kyrgyz' },
  { code: 'tg', label: 'Tajik' },
  { code: 'tk', label: 'Turkmen' },
  { code: 'ps', label: 'Pashto' },
  { code: 'ku', label: 'Kurdish' },
  { code: 'ckb', label: 'Central Kurdish' },
  { code: 'sq', label: 'Albanian' },
  { code: 'bs', label: 'Bosnian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'sh', label: 'Serbo-Croatian' },
  { code: 'is', label: 'Icelandic' },
  { code: 'ga', label: 'Irish' },
  { code: 'cy', label: 'Welsh' },
  { code: 'mt', label: 'Maltese' },
  { code: 'lb', label: 'Luxembourgish' },
  { code: 'fo', label: 'Faroese' },
  { code: 'sm', label: 'Samoan' },
  { code: 'to', label: 'Tongan' },
  { code: 'fj', label: 'Fijian' },
  { code: 'haw', label: 'Hawaiian' },
  { code: 'mi', label: 'Maori' },
  { code: 'qu', label: 'Quechua' },
  { code: 'ay', label: 'Aymara' },
  { code: 'gn', label: 'Guarani' },
  { code: 'tt', label: 'Tatar' },
  { code: 'ba', label: 'Bashkir' },
  { code: 'cv', label: 'Chuvash' },
  { code: 'sah', label: 'Yakut' },
  { code: 'ce', label: 'Chechen' },
  { code: 'os', label: 'Ossetian' },
  { code: 'mo', label: 'Moldavian' },
  { code: 'be', label: 'Belarusian' },
  { code: 'tt', label: 'Tatar' },
  { code: 'ba', label: 'Bashkir' },
  { code: 'cv', label: 'Chuvash' },
  { code: 'sah', label: 'Yakut' },
  { code: 'ce', label: 'Chechen' },
  { code: 'os', label: 'Ossetian' },
  { code: 'mo', label: 'Moldavian' },
  { code: 'be', label: 'Belarusian' },
  // ...add more as needed
];

const STATIC_TEXT = {
  title: 'Celestial Birth Chart Report',
  language: 'Language',
  birthDetails: 'Birth Details',
  name: 'Name',
  dob: 'Date of Birth',
  tob: 'Time of Birth',
  pob: 'Place of Birth',
  gender: 'Gender',
  keyPositions: 'Key Positions',
  ascendant: 'Ascendant (Rising Sign)',
  sunSign: 'Sun Sign',
  moonSign: 'Moon Sign',
  celestialInsights: 'Celestial Insights',
  yourCelestialBlueprint: 'Your Celestial Blueprint',
};

async function translateTextOpenAI(text: string, targetLang: string) {
  if (!text || targetLang === 'en') return text;
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang }),
  });
  const data = await res.json();
  return data.translatedText;
}

const KundliResult: React.FC = () => {
  const { result, clearResult } = useZodiac();
  const [language, setLanguage] = useState('en');
  const [translated, setTranslated] = useState<any>({});
  const [translating, setTranslating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) return;
    if (language === 'en') {
      setTranslated({});
      setTranslating(false);
      return;
    }
    setTranslating(true);
    async function doTranslate() {
      // Translate all static and dynamic text
      const staticKeys = Object.keys(STATIC_TEXT);
      const translatedStatic: Record<string, string> = {};
      for (const key of staticKeys) {
        translatedStatic[key] = await translateTextOpenAI(STATIC_TEXT[key as keyof typeof STATIC_TEXT], language);
      }
      const translatedPredictions: Record<string, string> = {};
      for (const [area, prediction] of Object.entries(result.predictions)) {
        translatedPredictions[area] = await translateTextOpenAI(prediction as string, language);
      }
      setTranslated({ static: translatedStatic, predictions: translatedPredictions });
      setTranslating(false);
    }
    doTranslate();
  }, [language, result]);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    let y = 10;
    const t = (k: string) => translated.static?.[k] || STATIC_TEXT[k as keyof typeof STATIC_TEXT];
    doc.setFontSize(18);
    doc.text(t('title'), 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`${t('language')}: ${LANGUAGES.find(l => l.code === language)?.label || language}`, 10, y);
    y += 10;
    doc.text(t('birthDetails') + ':', 10, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('name')}: ${result.birthDetails.fullName}`, 12, y); y += 7;
    doc.text(`${t('dob')}: ${result.birthDetails.dob}`, 12, y); y += 7;
    doc.text(`${t('tob')}: ${result.birthDetails.tob}`, 12, y); y += 7;
    doc.text(`${t('pob')}: ${result.birthDetails.pob}`, 12, y); y += 7;
    doc.text(`${t('gender')}: ${result.birthDetails.gender}`, 12, y); y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(t('keyPositions') + ':', 10, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('ascendant')}: ${result.ascendant}`, 12, y); y += 7;
    doc.text(`${t('sunSign')}: ${result.planets.sun.sign}`, 12, y); y += 7;
    doc.text(`${t('moonSign')}: ${result.planets.moon.sign}`, 12, y); y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(t('celestialInsights') + ':', 10, y); y += 8;
    doc.setFont('helvetica', 'normal');
    Object.entries(result.predictions).forEach(([area, prediction]: [string, any]) => {
      const text = translated.predictions?.[area] || prediction;
      doc.text(`${area.charAt(0).toUpperCase() + area.slice(1)}:`, 12, y); y += 6;
      doc.text(doc.splitTextToSize(text, 180), 14, y); y += 12;
    });
    // Add chart as image if possible
    if (chartRef.current) {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addPage();
      doc.setFontSize(16);
      doc.text(t('yourCelestialBlueprint'), 10, 20);
      doc.addImage(imgData, 'PNG', 10, 30, 180, 180);
    }
    doc.save(`kundli-report-${language}.pdf`);
  };

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-60 h-60 mx-auto">
            <ZodiacChart isPlaceholder />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-center text-purple-300 text-lg bg-indigo-950/70 backdrop-blur-sm p-4 rounded-lg">
              Your birth chart will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30 relative overflow-hidden mt-14 mb-14">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-5 bg-cover bg-center"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sun className="text-amber-300" size={20} />
              <span>{translated.static?.yourCelestialBlueprint || STATIC_TEXT.yourCelestialBlueprint}</span>
            </h2>
            <select
              className="ml-4 px-2 py-1 rounded bg-indigo-800 text-white border border-purple-500/40 focus:outline-none"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              title="Select language for report"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            {translating && <span className="ml-2 text-xs text-purple-300">Translating...</span>}
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700/70 transition-colors" 
                    title="Share Birth Chart">
              <Share2 size={18} />
            </button>
            <button className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700/70 transition-colors" 
                    title="Download Birth Chart"
                    onClick={handleDownloadPDF}>
              <Download size={18} />
            </button>
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700/70 transition-colors" 
              title="Start New Chart"
              onClick={clearResult}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        <div ref={resultRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-indigo-950/60 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium mb-3 text-purple-200">{translated.static?.birthDetails || STATIC_TEXT.birthDetails}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-purple-300" />
                    <span className="text-purple-300">{translated.static?.name || STATIC_TEXT.name}:</span>
                    <span className="text-white font-medium">{result.birthDetails.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-300" />
                    <span className="text-purple-300">{translated.static?.dob || STATIC_TEXT.dob}:</span>
                    <span className="text-white font-medium">{result.birthDetails.dob}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-300" />
                    <span className="text-purple-300">{translated.static?.tob || STATIC_TEXT.tob}:</span>
                    <span className="text-white font-medium">{result.birthDetails.tob}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-purple-300" />
                    <span className="text-purple-300">{translated.static?.pob || STATIC_TEXT.pob}:</span>
                    <span className="text-white font-medium">{result.birthDetails.pob}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-300" />
                    <span className="text-purple-300">{translated.static?.gender || STATIC_TEXT.gender}:</span>
                    <span className="text-white font-medium capitalize">{result.birthDetails.gender}</span>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-950/60 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3 text-purple-200">{translated.static?.keyPositions || STATIC_TEXT.keyPositions}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ArrowUp size={16} className="text-amber-300" />
                    <span className="text-purple-300">{translated.static?.ascendant || STATIC_TEXT.ascendant}:</span>
                    <span className="text-white font-medium">{result.ascendant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-amber-300" />
                    <span className="text-purple-300">{translated.static?.sunSign || STATIC_TEXT.sunSign}:</span>
                    <span className="text-white font-medium">{result.planets.sun.sign}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-blue-200" />
                    <span className="text-purple-300">{translated.static?.moonSign || STATIC_TEXT.moonSign}:</span>
                    <span className="text-white font-medium">{result.planets.moon.sign}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(result.planets).map(([planet, data]: [string, any]) => (
                    <PlanetInfo 
                      key={planet} 
                      planet={planet} 
                      sign={data.sign} 
                      house={data.house}
                      degree={data.degree}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="aspect-square relative" ref={chartRef}>
                <ZodiacChart />
              </div>
              <div className="bg-indigo-950/60 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3 text-purple-200">{translated.static?.celestialInsights || STATIC_TEXT.celestialInsights}</h3>
                <div className="space-y-4">
                  {Object.entries(result.predictions).map(([area, prediction]: [string, any]) => (
                    <div key={area} className="border-l-2 border-purple-500 pl-3">
                      <h4 className="text-amber-200 font-medium capitalize mb-1">{area}</h4>
                      <p className="text-sm text-purple-100">{translated.predictions?.[area] || prediction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KundliResult;