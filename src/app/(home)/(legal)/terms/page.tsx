import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Gemish",
  description: "Terms and Conditions for Gemish",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* T&C Content */}
        <h1 className="text-4xl font-bold mb-6">
          Terms and Conditions for Gemish
        </h1>
        <p className="text-gray-400 mb-4">Last Updated: March 21, 2025</p>

        <p className="mb-4">
          Welcome to Gemish! These Terms and Conditions ("Terms") govern your
          use of Gemish, a chat application provided by [Your Company Name]. By
          accessing or using Gemish, you agree to be bound by these Terms. If
          you do not agree with these Terms, please do not use our app.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Eligibility</h2>
        <p className="mb-4">
          You must be at least 13 years old to use Gemish. By creating an
          account or using the app, you confirm that you meet this age
          requirement and have the legal capacity to enter into this agreement.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Account Responsibilities
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials (e.g., username, password).
          </li>
          <li>
            You are responsible for all activities that occur under your
            account.
          </li>
          <li>
            You must notify us immediately at support@gemish.com if you suspect
            unauthorized use of your account.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Acceptable Use</h2>
        <p className="mb-4">
          You agree to use Gemish in a manner that is lawful, respectful, and
          consistent with these Terms. You may not:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Share or upload illegal, harmful, offensive, or copyrighted content
            (e.g., in text chats, images, or PDFs) without permission.
          </li>
          <li>
            Engage in harassment, hate speech, or any form of abusive behavior.
          </li>
          <li>
            Attempt to hack, disrupt, or interfere with the app’s functionality
            or other users’ experiences.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. User-Generated Content
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            You retain ownership of the content you upload to Gemish, including
            text messages, images, and PDFs.
          </li>
          <li>
            By uploading content, you grant Gemish a non-exclusive, worldwide,
            royalty-free license to store, process, and display this content to
            provide our chat services.
          </li>
          <li>
            You are solely responsible for the content you upload. Gemish is not
            liable for the accuracy, legality, or appropriateness of
            user-generated content.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Intellectual Property
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Gemish, including its design, features, and branding, is protected
            by intellectual property laws. You may not reproduce, modify, or
            distribute any part of the app without our written consent.
          </li>
          <li>
            You may not use our trademarks, logos, or other proprietary
            materials without permission.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Termination</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We reserve the right to suspend or terminate your account if you
            violate these Terms, such as by engaging in prohibited behavior.
          </li>
          <li>
            You may terminate your account at any time by deleting it through
            the app’s settings.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Limitation of Liability
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Gemish is provided "as is" and "as available." We do not guarantee
            that the app will be error-free or uninterrupted.
          </li>
          <li>
            We are not liable for any indirect, incidental, or consequential
            damages arising from your use of Gemish, including but not limited
            to loss of data, content, or inability to access the app.
          </li>
          <li>
            Our total liability to you for any claim arising from these Terms
            will not exceed $100.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          8. Changes to These Terms
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We may update these Terms from time to time. We will notify you of
            significant changes via email or through the app.
          </li>
          <li>
            Continued use of Gemish after changes constitutes your acceptance of
            the updated Terms.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">9. Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the laws of [Your Jurisdiction, e.g.,
          California, USA], without regard to its conflict of law principles.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact Us</h2>
        <p className="mb-4">
          If you have questions about these Terms, please contact us at
          nextgemish@gmail.com.
        </p>
      </div>
    </div>
  );
}
