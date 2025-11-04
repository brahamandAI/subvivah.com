'use client';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>

        <div className="space-y-8">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Assistance?</h2>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you with any questions or issues you may have. For immediate assistance, 
              please email us at{' '}
              <a href="mailto:subvivah.com@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                subvivah.com@gmail.com
              </a>
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I create an account?</h3>
                <p className="text-gray-600">
                  Click on the "Sign Up" button in the top right corner of the homepage. Fill in your details, verify your email address, and complete your profile to get started.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How can I update my profile?</h3>
                <p className="text-gray-600">
                  Log in to your account, go to your profile page, and click on the "Edit Profile" button. You can update your information, add photos, and modify your preferences.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I search for matches?</h3>
                <p className="text-gray-600">
                  Use our advanced search filters to find potential matches based on your preferences. You can filter by age, location, education, profession, and more.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Is my information secure?</h3>
                <p className="text-gray-600">
                  Yes, we take your privacy seriously. We use industry-standard security measures to protect your personal information. You can read more about our privacy practices in our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                If you couldn't find the answer you were looking for, our support team is ready to help:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:subvivah.com@gmail.com" className="text-purple-600 hover:text-purple-700">
                    subvivah.com@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Hours</h2>
            <p className="text-gray-600">
              Our support team is available Monday through Friday, 9:00 AM to 6:00 PM (IST).
              We aim to respond to all inquiries within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 