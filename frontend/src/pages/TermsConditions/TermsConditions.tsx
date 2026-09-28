import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldAlert, Users, ShoppingBag, AlertTriangle, Scale, Mail } from 'lucide-react';

export const TermsConditions: React.FC = () => {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Breadcrumbs */}
      <nav className="view-breadcrumbs" style={{ marginBottom: '16px' }}>
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Terms and Conditions</span>
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
            <FileCheck style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
              Terms and Conditions
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
              Effective Date: March 2026 • SwapIt Marketplace Platform
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          Welcome to SwapIt. By accessing, browsing, registering on, or using our platform, you agree to comply with and be bound by the following Terms and Conditions of Service. Please read these terms carefully before posting listings or engaging in transactions.
        </p>
      </div>

      {/* Terms Sections */}
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
            <Users style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              1. User Eligibility and Account Responsibility
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You must be at least 18 years of age to register an account and post classified advertisements on SwapIt.</li>
              <li>You agree to provide accurate, up-to-date, and authentic contact details during registration and profile creation.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials and password.</li>
              <li>SwapIt reserves the right to suspend or terminate accounts that provide misleading information or engage in suspicious conduct.</li>
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
            <ShoppingBag style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              2. Listing Guidelines and Prohibited Items
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              All sellers must adhere strictly to honest and lawful listing practices:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Accurate Descriptions:</strong> Item condition (Brand New, Like New, Good, Fair), functionality, defects, and authentic photographs of the actual physical product must be truthfully presented.
              </li>
              <li>
                <strong>Prohibited Content:</strong> Users may not post counterfeit items, stolen property, hazardous substances, prescription drugs, weapons, or illegal contraband.
              </li>
              <li>
                <strong>Ownership:</strong> You must have lawful title and legal authority to sell or swap any item listed on the platform.
              </li>
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
            <ShieldAlert style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              3. Transactions and Safe In-Person Trading
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              SwapIt operates as a peer-to-peer connection service for local buyers and sellers:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>All pricing agreements, physical inspections, item handovers, and payments are conducted directly between buyers and sellers.</li>
              <li>We strongly recommend meeting in well-lit public places (such as metro stations, cafes, or shopping centers) for item inspection and handover.</li>
              <li>Always test electronics, verify vehicle paperwork, and never release advance payments before receiving and inspecting items in person.</li>
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
            <Scale style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              4. Platform Role and Limitation of Liability
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '10px' }}>
              SwapIt provides intermediary classified advertising services. To the maximum extent permitted by applicable law:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>SwapIt does not possess, manufacture, inspect, warranty, or deliver the physical goods listed by individual users.</li>
              <li>SwapIt shall not be liable for any indirect, incidental, or consequential damages resulting from user disputes, in-person meetings, or product defects.</li>
              <li>Users agree to resolve disputes amicably and in accordance with the Consumer Protection Act and local arbitration procedures.</li>
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
              5. Contact and Legal Inquiries
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '8px' }}>
              For legal notices, policy inquiries, or report of rule violations:
            </p>
            <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>SwapIt Legal Department</p>
              <p style={{ margin: '2px 0', color: '#64748b' }}>SwapIt Technologies India Private Limited</p>
              <p style={{ margin: '2px 0', color: '#2563eb' }}>Email: legal@swapit.in | compliance@swapit.in</p>
              <p style={{ margin: '2px 0 0', color: '#64748b' }}>Chennai, Tamil Nadu, India</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
