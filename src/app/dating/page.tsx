'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import RestaurantDiscovery from '@/components/RestaurantDiscovery';
import StaticDating from '@/components/StaticDating';
import withAuth from '@/components/withAuth';

interface DatingProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  photos: {
    url: string;
    isProfilePhoto: boolean;
  }[];
}

interface Restaurant {
  id: string;
  name: string;
  location: string;
  rating: number;
  ambiance: string;
  cuisine: string;
  priceRange: string;
  imageUrl: string;
}

interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  specialRequests: string;
}

declare global {
  interface Window {
    WebChat: any;
  }
}

const DATING_QUOTES = [
  "Find your perfect match and create beautiful memories together",
  "Love is in the air, and so is the perfect date",
  "Every moment becomes special when shared with the right person",
  "Your perfect date is just a click away",
  "Discover love in the most romantic settings"
];

export default function DatingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tableType, setTableType] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);
  const [selectedRestaurantImages, setSelectedRestaurantImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: ''
  });
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        
        if (data.isAuthenticated && data.user) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % DATING_QUOTES.length);
    }, 5000);
    return () => clearInterval(quoteInterval);
  }, []);

  const fetchRestaurants = async () => {
    try {
      // Simulate fetching restaurant data with images
      const data = {
        restaurants: [
          {
            id: '1',
            name: 'Symposium World Cuisine',
            location: 'Sector-12 Dwarka Delhi',
            rating: 4.7,
            ambiance: 'Modern & Chic',
            cuisine: 'World Cuisine',
            priceRange: '₹₹₹',
            imageUrl: '/images/restaurants/symposium-pdr-interior.jpg'
          },
          {
            id: '2',
            name: 'Cafe After Hours',
            location: 'Sector-12 Dwarka Delhi',
            rating: 4.8,
            ambiance: 'Romantic',
            cuisine: 'Italian & Continental',
            priceRange: '₹₹',
            imageUrl: '/images/restaurants/cafe-after-hours-1.jpg'
          },
          {
            id: '3',
            name: 'Panache',
            location: 'Sector 17 Dwarka Delhi',
            rating: 4.6,
            ambiance: 'Cozy & Elegant',
            cuisine: 'Multi-cuisine',
            priceRange: '₹₹₹',
            imageUrl: '/images/restaurants/panache-1.jpg'
          }
        ]
      };
      setRestaurants(data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowRestaurantDetails(true);
    // Set restaurant images based on the restaurant name
    if (restaurant.name === 'Symposium World Cuisine') {
      setSelectedRestaurantImages([
        '/images/restaurants/symposium-pdr-1.jpg',
        '/images/restaurants/symposium-pdr-2.jpg',
        '/images/restaurants/symposium-pdr-food.jpg',
        '/images/restaurants/symposium-pdr-interior.jpg'
      ]);
    } else if (restaurant.name === 'Cafe After Hours') {
      setSelectedRestaurantImages([
        '/images/restaurants/cafe-after-hours-1.jpg',
        '/images/restaurants/cafe-after-hours-2.jpg',
        '/images/restaurants/cafe-after-hours-3.jpg',
        '/images/restaurants/cafe-after-hours-4.jpg',
        '/images/restaurants/cafe-after-hours-5.jpg'
      ]);
    } else if (restaurant.name === 'Panache') {
      setSelectedRestaurantImages([
        '/images/restaurants/panache-1.jpg',
        '/images/restaurants/panache-2.jpg',
        '/images/restaurants/panache-3.jpg',
        '/images/restaurants/panache-4.jpg',
        '/images/restaurants/panache-5.jpg'
      ]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/book-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant?.id,
          ...bookingFormData
        }),
      });
      if (response.ok) {
        alert('Table booked successfully!');
        setShowBookingPopup(false);
        setBookingFormData({
          name: '',
          phone: '',
          date: '',
          time: '',
          guests: '2',
          specialRequests: ''
        });
      }
    } catch (error) {
      console.error('Error booking table:', error);
      alert('Failed to book table. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <svg className="animate-spin h-14 w-14 text-purple-300 mb-4" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
            <circle className="opacity-70" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="31.4 94.2" />
          </svg>
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <StaticDating />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Romantic Dining Venues</h1>
          <p className="text-xl text-purple-200">Discover the perfect setting for your special moments</p>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="relative h-48 md:h-64">
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{restaurant.name}</h3>
                <p className="text-purple-200 text-sm mb-1">{restaurant.location}</p>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-purple-200 text-sm">{restaurant.rating}</span>
                </div>
                <p className="text-purple-200 text-sm mb-2">{restaurant.ambiance} • {restaurant.cuisine}</p>
                <p className="text-purple-200 text-sm mb-3">{restaurant.priceRange}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRestaurant(restaurant);
                    setShowBookingPopup(true);
                  }}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Book a Table
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurant Details Modal */}
        {showRestaurantDetails && selectedRestaurant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedRestaurant.name}</h2>
                  <button
                    onClick={() => setShowRestaurantDetails(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Image Gallery */}
                <div className="mb-4 sm:mb-6">
                  <div className="relative h-[250px] sm:h-[400px] rounded-lg overflow-hidden mb-3 sm:mb-4">
                    <Image
                      src={selectedRestaurant.imageUrl}
                      alt={selectedRestaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {selectedRestaurantImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-16 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedRestaurant({ ...selectedRestaurant, imageUrl: image })}
                      >
                        <Image
                          src={image}
                          alt={`${selectedRestaurant.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurant Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Location</h3>
                    <p className="text-sm sm:text-base text-purple-200">{selectedRestaurant.location}</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Cuisine</h3>
                    <p className="text-sm sm:text-base text-purple-200">{selectedRestaurant.cuisine}</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Ambiance</h3>
                    <p className="text-sm sm:text-base text-purple-200">{selectedRestaurant.ambiance}</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Price Range</h3>
                    <p className="text-sm sm:text-base text-purple-200">{selectedRestaurant.priceRange}</p>
                  </div>
                </div>

                {/* Rating and Hours */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    <span className="text-sm sm:text-base text-white font-semibold">{selectedRestaurant.rating}</span>
                  </div>
                  <span className="text-purple-200">•</span>
                  <span className="text-sm sm:text-base text-purple-200">Open 11:00 AM - 11:00 PM</span>
                </div>

                {/* Book Table Button */}
                <button
                  onClick={() => {
                    setShowRestaurantDetails(false);
                    setShowBookingPopup(true);
                  }}
                  className="w-full bg-purple-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-purple-700 transition-colors text-base sm:text-lg font-semibold"
                >
                  Book a Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Popup */}
        {showBookingPopup && selectedRestaurant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-md">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Book a Table</h2>
                  <button
                    onClick={() => setShowBookingPopup(false)}
                    className="text-white hover:text-purple-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={bookingFormData.name}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-purple-300"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-1">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={bookingFormData.phone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-purple-300"
                      placeholder="Your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-purple-200 mb-1">Date</label>
                    <input
                      type="date"
                      id="date"
                      value={bookingFormData.date}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-purple-200 mb-1">Time</label>
                    <input
                      type="time"
                      id="time"
                      value={bookingFormData.time}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-purple-200 mb-1">Number of Guests</label>
                    <select
                      id="guests"
                      value={bookingFormData.guests}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, guests: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                      required
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-purple-200 mb-1">Special Requests</label>
                    <textarea
                      id="specialRequests"
                      value={bookingFormData.specialRequests}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-purple-300"
                      placeholder="Any special requests or preferences"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

// Add this to your global CSS or create a new CSS module
const styles = `
@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}

.animate-fade-in-out {
  animation: fadeInOut 5s ease-in-out infinite;
}
`; 