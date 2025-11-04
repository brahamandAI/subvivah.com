import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="hidden sm:block bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">शुभ विवाह</h3>
              <p className="text-gray-600">
                शुभ विवाह is a trusted matrimonial platform built on the foundation of tradition, respect, and lifelong commitment. Our mission is to bring together individuals who are not just seeking a life partner but a lifelong companion.
              </p>
              <p className="text-gray-600">
                Join <span className="text-purple-600 font-bold">शुभ विवाह</span> — because your forever deserves to begin with trust.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/search" className="text-gray-300 hover:text-white">Search</Link></li>
              <li><Link href="/matches" className="text-gray-300 hover:text-white">Matches</Link></li>
              <li><Link href="/messages" className="text-gray-300 hover:text-white">Messages</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
              <li><Link href="/help" className="text-gray-300 hover:text-white">Help & Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} शुभ विवाह. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 