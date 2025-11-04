'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Restaurant {
  id: string;
  name: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
      </div>
    </motion.div>
  );
};

interface RestaurantModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const RestaurantModal = ({ restaurant, onClose }: RestaurantModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{restaurant.name}</h2>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface RestaurantDiscoveryProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  onBookTable: () => void;
  tableType: string;
  setTableType: (type: string) => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
}

export default function RestaurantDiscovery({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onBookTable,
  tableType,
  setTableType,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime
}: RestaurantDiscoveryProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Discover Perfect Dining Spots</h1>
          <p className="mt-4 text-lg text-gray-600">
            Find the ideal restaurant for your special moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant(restaurant)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedRestaurant && (
            <RestaurantModal
              restaurant={selectedRestaurant}
              onClose={() => onSelectRestaurant(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 