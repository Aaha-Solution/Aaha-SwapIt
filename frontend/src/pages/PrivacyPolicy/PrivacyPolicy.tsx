import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, UserCheck, Bell, RefreshCw, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Breadcrumbs */}
      <nav className="view-breadcrumbs" style={{ marginBottom: '16px' }}>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Privacy Policy</span>
      </nav>

      {/* Header Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
              Last Updated: March 2026 • SwapIt Technologies India Private Limited
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          SwapIt ("we", "our", or "us") is dedicated to protecting your personal data and respecting your privacy. This Privacy Policy describes how we collect, store, utilize, and protect your information when you access our community marketplace web application, mobile interfaces, and associated services.
        </p>
      </div>

      {/* Policy Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1 */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <FileText style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              1. Information We Collect
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              We collect information to provide, maintain, and enhance our local classifieds and swap platform:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Account Information:</strong> Name, phone number, email address, profile avatar, and account authentication credentials when you register.
              </li>
              <li>
                <strong>Listing & Transaction Information:</strong> Item titles, descriptions, categories, photos, condition notes, asking prices, swap preferences, and neighborhood location data.
              </li>
              <li>
                <strong>Communications:</strong> Real-time messages, offer negotiations, customer support inquiries, and seller ratings/reviews exchanged between users on the platform.
              </li>
              <li>
                <strong>Technical & Device Data:</strong> IP address, browser type, operating system, device identifiers, and standard session logs to ensure account security and prevent fraudulent activity.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Eye style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              2. How We Use Your Information
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              Your information is processed for specific, transparent purposes:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Facilitating item discovery, buyer-seller connections, and in-app chat communications.</li>
              <li>Enabling verified user profiles and reputation scores to build trust within local neighborhoods.</li>
              <li>Preventing spam, fraudulent listings, unauthorized account takeovers, and prohibited items.</li>
              <li>Delivering critical deal alerts, offer responses, and price drop notifications you request.</li>
              <li>Complying with applicable legal, statutory, and regulatory obligations under Indian law.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Lock style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              3. Data Sharing and Protection
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              We do not sell, rent, or monetize your private personal information to third-party advertisers. Information is only shared under the following conditions:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Public Listings:</strong> Product details, asking price, general locality (e.g., Chennai or Bangalore), and public seller profile information are visible to other marketplace users.
              </li>
              <li>
                <strong>Verified Service Providers:</strong> Secure infrastructure providers (hosting, database storage, SMS authentication, payment gateway partners) under strict confidentiality agreements.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When compelled by court orders, lawful requests from law enforcement agencies, or to protect the physical safety of community members.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <UserCheck style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              4. Your Rights & Data Control
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              You retain full control over your personal data:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Access, edit, or update your profile details and listings at any time through your Account settings.</li>
              <li>Delete your listings, conversation histories, or deactivate your SwapIt account.</li>
              <li>Opt-in or opt-out of promotional communications, browser push notifications, and email updates.</li>
              <li>Request a complete export of your personal information stored in our databases.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Mail style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              5. Contact Our Data Protection Officer
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '8px' }}>
              If you have any questions, concerns, or grievances regarding this Privacy Policy or our data handling practices, please contact our privacy desk:
            </p>
            <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>SwapIt Technologies India Pvt. Ltd.</p>
              <p style={{ margin: '2px 0', color: '#64748b' }}>Grievance Officer & Data Protection Desk</p>
              <p style={{ margin: '2px 0', color: '#2563eb' }}>Email: privacy@swapit.in | support@swapit.in</p>
              <p style={{ margin: '2px 0 0', color: '#64748b' }}>Puducherry, India</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
