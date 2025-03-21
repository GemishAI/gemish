import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Gemish",
  description: "Privacy Policy for Gemish",
};

export default function PrivacyPolicyPage() {
  return (
    <div className=" py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Privacy Policy Content */}
        <h1 className="text-4xl font-bold mb-6">Privacy Policy for Gemish</h1>
        <p className="text-gray-400 mb-4">Last Updated: March 21, 2025</p>

        <p className="mb-4">
          At Gemish, we value your privacy and are committed to protecting your
          personal information. This Privacy Policy explains how we collect,
          use, store, and protect your data when you use Gemish, a chat
          application that allows you to chat with text, images, and PDFs. By
          using Gemish, you agree to the practices described in this policy. If
          you do not agree, please do not use our app.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          We collect the following types of information when you use Gemish:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Account Information:</strong> When you create an account, we
            collect your email address, username, and any other information you
            provide during sign-up.
          </li>
          <li>
            <strong>Chat Content:</strong> We collect the content you share in
            chats, including text messages, images, and PDFs, to provide our
            services.
          </li>
          <li>
            <strong>Device Information:</strong> We may collect information
            about your device, such as your IP address, browser type, and
            operating system, to improve app performance and security.
          </li>
          <li>
            <strong>Usage Data:</strong> We collect data about how you use
            Gemish, such as the features you access and the duration of your
            sessions, to enhance your experience.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use your information for the following purposes:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            To provide and maintain Gemish’s chat services, including enabling
            text, image, and PDF chat functionality.
          </li>
          <li>
            To process images and PDFs (e.g., extracting text) to generate chat
            responses.
          </li>
          <li>
            To improve our app, troubleshoot issues, and develop new features.
          </li>
          <li>
            To ensure the security of our app and prevent fraudulent or abusive
            behavior.
          </li>
          <li>
            To communicate with you, such as sending account-related
            notifications or responding to your inquiries.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. How We Share Your Information
        </h2>
        <p className="mb-4">
          We do not sell your personal information. We may share your data in
          the following circumstances:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Service Providers:</strong> We may share your data with
            third-party service providers (e.g., cloud storage providers like
            Neon or AWS) to help us operate Gemish.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose your data if
            required by law or to protect our rights, safety, or property.
          </li>
          <li>
            <strong>With Your Consent:</strong> We may share your data with
            other parties if you give us explicit permission to do so.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Data Storage and Retention
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We store your data on secure servers using industry-standard
            encryption.
          </li>
          <li>
            We retain your account information and chat content for as long as
            your account is active. If you delete your account, we will remove
            your data within 30 days, except as required by law.
          </li>
          <li>
            You can request the deletion of your data at any time by contacting
            us at support@gemish.com.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="mb-4">
          Depending on your location, you may have the following rights
          regarding your personal data:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Access:</strong> You can request a copy of the data we have
            about you.
          </li>
          <li>
            <strong>Correction:</strong> You can request that we correct
            inaccurate or incomplete data.
          </li>
          <li>
            <strong>Deletion:</strong> You can request that we delete your data.
          </li>
          <li>
            <strong>Objection:</strong> You can object to certain uses of your
            data, such as for analytics.
          </li>
        </ul>
        <p className="mb-4">
          To exercise these rights, please contact us at support@gemish.com. We
          will respond to your request within 30 days.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Security</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We use industry-standard encryption to protect your data during
            transmission and storage.
          </li>
          <li>
            While we take reasonable measures to secure your data, no system is
            completely immune to breaches. We are not liable for unauthorized
            access to your data due to circumstances beyond our control.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Cookies and Tracking
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We use cookies to improve your experience on Gemish, such as
            remembering your login status.
          </li>
          <li>
            You can manage cookie preferences through your browser settings.
            Note that disabling cookies may affect the functionality of the app.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          8. International Data Transfers
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            If you are located outside of [Your Jurisdiction, e.g., the United
            States], your data may be transferred to and stored in servers
            located in [Your Jurisdiction]. By using Gemish, you consent to this
            transfer.
          </li>
          <li>
            We ensure that any international data transfers comply with
            applicable data protection laws, such as GDPR.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          9. Children’s Privacy
        </h2>
        <p className="mb-4">
          Gemish is not intended for children under 13 years of age. We do not
          knowingly collect personal information from children under 13. If we
          learn that we have collected such information, we will delete it
          immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          10. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify
          you of significant changes via email or through the app. Continued use
          of Gemish after changes constitutes your acceptance of the updated
          policy.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">11. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy or our data practices,
          please contact us at nextgemish@gmail.com
        </p>
      </div>
    </div>
  );
}
