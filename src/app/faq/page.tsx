export default function FAQ() {
  const faqs = [
    {
      question: "How do I create a profile?",
      answer: "To create a profile, click on the 'Register' button in the top navigation. Fill in your basic information, personal details, and preferences. You can also upload photos and add more information later."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take your privacy seriously. Your personal information is protected by advanced security measures. We never share your contact details without your permission, and you can control what information is visible to other users."
    },
    {
      question: "How does the matching system work?",
      answer: "Our matching system uses your profile information and preferences to find compatible matches. You can also use the search filters to find profiles based on specific criteria like age, location, education, and more."
    },
    {
      question: "What are the premium features?",
      answer: "Premium features include advanced search options, unlimited messaging, profile highlighting, seeing who viewed your profile, and priority in search results. You can upgrade to premium anytime from your account settings."
    },
    {
      question: "How can I contact other members?",
      answer: "You can send messages to other members through our secure messaging system. Free members have limited messages, while premium members enjoy unlimited messaging."
    },
    {
      question: "What should I do if I find inappropriate content?",
      answer: "If you come across any inappropriate content or behavior, please report it immediately using the 'Report' button on the profile or message. Our team will review and take appropriate action."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account by going to Account Settings and selecting 'Delete Account'. Please note that this action is irreversible and all your data will be permanently removed."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, net banking, and popular digital wallets. All payments are processed through secure payment gateways."
    },
    {
      question: "Can I change my preferences after registration?",
      answer: "Yes, you can update your preferences anytime by going to your profile settings. Changes will be reflected in your matches and search results."
    },
    {
      question: "How do I verify my profile?",
      answer: "To verify your profile, go to your account settings and follow the verification process. You'll need to upload a government-issued ID and a recent photo. Verified profiles get a special badge and more visibility."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about our services and features.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions?{' '}
            <a href="/contact" className="text-purple-600 hover:text-purple-700">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 