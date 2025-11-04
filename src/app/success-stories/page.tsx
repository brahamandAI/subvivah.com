'use client';

import Image from 'next/image';
import { useState } from 'react';

const successStories = [
  {
    id: 1,
    couple: {
      name: 'Rahul & Priya',
      location: 'Delhi',
      married: '2022',
      photo: '/images/couple1.jpg',
      video: 'https://www.youtube.com/embed/example1',
    },
    story: 'We met through शुभ विवाह and instantly connected. Our families were involved from the beginning, and the horoscope matching was perfect. We got married within 6 months of meeting and are now happily settled in Delhi.',
  },
  {
    id: 2,
    couple: {
      name: 'Amit & Neha',
      location: 'Mumbai',
      married: '2023',
      photo: '/images/couple2.jpg',
      video: 'https://www.youtube.com/embed/example2',
    },
    story: 'The advanced matchmaking algorithm helped us find each other despite being in different cities. The video profile feature helped us connect better, and the family involvement made the process smooth and trustworthy.',
  },
  {
    id: 3,
    couple: {
      name: 'Vikram & Anjali',
      location: 'Bangalore',
      married: '2023',
      photo: '/images/couple3.jpg',
      video: 'https://www.youtube.com/embed/example3',
    },
    story: 'We were both skeptical about online matrimonial platforms, but शुभ विवाह changed our perspective. The verification process and privacy features made us feel secure, and we found our perfect match.',
  },
];

const videoTestimonials = [
  {
    id: 1,
    title: 'Our Journey to Finding Each Other',
    couple: 'Rahul & Priya',
    videoUrl: 'https://www.youtube.com/embed/example1',
    thumbnail: '/images/video1-thumb.jpg',
  },
  {
    id: 2,
    title: 'From Online Match to Marriage',
    couple: 'Amit & Neha',
    videoUrl: 'https://www.youtube.com/embed/example2',
    thumbnail: '/images/video2-thumb.jpg',
  },
  {
    id: 3,
    title: 'Finding Love Through Trust',
    couple: 'Vikram & Anjali',
    videoUrl: 'https://www.youtube.com/embed/example3',
    thumbnail: '/images/video3-thumb.jpg',
  },
];

const features = [
  {
    title: 'Verified Profiles',
    description: 'Every profile goes through a rigorous verification process',
    icon: '✓',
  },
  {
    title: 'Family Involvement',
    description: 'Dedicated features for family participation in the matchmaking process',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    title: 'Horoscope Matching',
    description: 'Expert astrological compatibility analysis',
    icon: '⭐',
  },
  {
    title: 'Privacy Protection',
    description: 'Advanced privacy controls and secure communication',
    icon: '🔒',
  },
];

export default function SuccessStories() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories of couples who found their perfect match through शुभ विवाह
          </p>
        </div>

        {/* Video Testimonials Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Video Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedVideo(testimonial.videoUrl)}
              >
                <div className="relative h-48">
                  <Image
                    src={testimonial.thumbnail}
                    alt={testimonial.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {testimonial.title}
                  </h3>
                  <p className="text-gray-600">{testimonial.couple}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl mx-4">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={selectedVideo}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {successStories && successStories.length > 0 ? successStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-64">
                <Image
                  src={story.couple.photo}
                  alt={story.couple.name}
                  fill
                  className="object-cover"
                />
                {story.couple.video && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                    onClick={() => setSelectedVideo(story.couple.video)}
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {story.couple.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {story.couple.location} • Married {story.couple.married}
                </p>
                <p className="text-gray-600">{story.story}</p>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No success stories available at the moment.</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose शुभ विवाह?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of successful matches who found their life partners through our trusted platform
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-purple-700">
            Create Your Profile Now
          </button>
        </div>
      </div>
    </div>
  );
} 