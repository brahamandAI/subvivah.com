'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-purple max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              We collect information that you provide directly to us, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-8">
              <li>Personal information (name, email, phone number)</li>
              <li>Profile information (photos, bio, interests)</li>
              <li>Communication preferences</li>
              <li>Payment information (for premium services)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-6">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-8">
              <li>Provide and improve our services</li>
              <li>Match you with potential partners</li>
              <li>Send you important updates and notifications</li>
              <li>Process payments and prevent fraud</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-6">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-8">
              <li>Other users (as per your privacy settings)</li>
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-8">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-gray-600 mb-2">If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">Email:</span> info@therobustrix.com
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Phone:</span> 011-41653157
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">WhatsApp:</span> +91-9090020245
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 