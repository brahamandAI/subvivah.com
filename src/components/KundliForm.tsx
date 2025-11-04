import React from 'react';
import { 
  Calendar, 
  Clock, 
  Map, 
  User, 
  Users, 
  Sparkles, 
  Loader2
} from 'lucide-react';
import { useZodiac } from '../context/ZodiacContext';
import FormField from './ui/FormField';
import CityAutocomplete from './CityAutocomplete';

const KundliForm: React.FC = () => {
  const { loading, setLoading, setError, setResult } = useZodiac();
  const [city, setCity] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName'),
      dob: formData.get('dob'),
      tob: formData.get('tob'),
      pob: city,
      gender: formData.get('gender')
    };

    try {
      // Simulate API call for demonstration
      // In production, uncomment the actual fetch call
      /*
      const response = await fetch('/api/kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate kundli');
      }
      */
      
      // Simulate API response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample result data
      const mockResult = {
        ascendant: "Libra",
        planets: {
          sun: { sign: "Taurus", house: 8, degree: 15.5 },
          moon: { sign: "Cancer", house: 10, degree: 22.3 },
          mercury: { sign: "Aries", house: 7, degree: 5.8 },
          venus: { sign: "Gemini", house: 9, degree: 2.1 },
          mars: { sign: "Pisces", house: 6, degree: 28.7 },
          jupiter: { sign: "Capricorn", house: 4, degree: 10.2 },
          saturn: { sign: "Aquarius", house: 5, degree: 18.9 },
          rahu: { sign: "Sagittarius", house: 3, degree: 7.4 },
          ketu: { sign: "Gemini", house: 9, degree: 7.4 }
        },
        houses: {
          1: "Libra",
          2: "Scorpio",
          3: "Sagittarius",
          4: "Capricorn",
          5: "Aquarius",
          6: "Pisces",
          7: "Aries",
          8: "Taurus",
          9: "Gemini",
          10: "Cancer",
          11: "Leo",
          12: "Virgo"
        },
        birthDetails: {
          fullName: data.fullName,
          dob: data.dob,
          tob: data.tob,
          pob: data.pob,
          gender: data.gender
        },
        predictions: {
          personality: "You have a balanced and harmonious nature with strong intuitive abilities.",
          career: "You may excel in creative fields or positions requiring analytical thinking.",
          relationships: "You value emotional connection and loyalty in relationships.",
          health: "Pay attention to digestive health and maintain balance in daily routines."
        }
      };

      setResult(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30 mt-8 mb-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Sparkles className="text-amber-300" size={20} />
        <span>Enter Your Birth Details</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          required
          icon={<User size={18} />}
        />

        <FormField
          label="Date of Birth"
          name="dob"
          type="date"
          required
          icon={<Calendar size={18} />}
        />

        <FormField
          label="Time of Birth"
          name="tob"
          type="time"
          required
          icon={<Clock size={18} />}
          hint="As accurate as possible for best results"
        />

        <div>
          <label className="block text-sm font-medium text-purple-200 flex items-center gap-2 mb-1">
            <Map size={18} />
            <span>Place of Birth</span>
          </label>
          <CityAutocomplete value={city} onChange={setCity} required />
          <p className="text-xs text-purple-300/70 mt-1">Enter city and country for accurate positioning</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-purple-200 flex items-center gap-2">
            <Users size={18} />
            <span>Gender</span>
          </label>
          <select 
            name="gender" 
            className="w-full p-3 rounded-lg bg-indigo-800/50 border border-purple-500/40 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 [&>option]:bg-indigo-900 [&>option]:text-white [&>option]:py-2"
          >
            <option value="male" className="bg-indigo-900 text-white">Male</option>
            <option value="female" className="bg-indigo-900 text-white">Female</option>
            <option value="other" className="bg-indigo-900 text-white">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-7 w-7 text-purple-200" viewBox="0 0 50 50">
                <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
                <circle className="opacity-70" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="31.4 94.2" />
              </svg>
              <span>Consulting the Stars...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Birth Chart</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default KundliForm;