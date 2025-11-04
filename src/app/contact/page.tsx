'use client';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="space-y-6">
          <p className="text-lg text-gray-600">
            We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            
              <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <a href="mailto:subvivah.com@gmail.com" className="text-purple-600 hover:text-purple-700">
                    subvivah.com@gmail.com
                  </a>
                </div>
                </div>

              <div className="flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="text-gray-900">212, City Centre Mall, Dwarka Sector-12, New Delhi</p>
                </div>
                </div>
              </div>
            </div>

          <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
            <p className="text-gray-600">
              Our support team is available Monday through Friday, 9:00 AM to 6:00 PM (IST).
              We strive to respond to all inquiries within 24 hours during business days.
            </p>
            </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Support</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• For account-related issues, please include your registered email address</li>
              <li>• For technical support, please provide detailed information about the issue</li>
              <li>• For privacy concerns, our team will prioritize your request</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 