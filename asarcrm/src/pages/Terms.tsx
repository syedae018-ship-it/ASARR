import { PageHeader } from "@/components/dashboard/PageHeader";

export default function Terms() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Terms of Service" 
        description="Last updated: December 2024"
      />

      <div className="max-w-3xl glass rounded-xl p-8 space-y-8 animate-slide-up">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using the Agency Dashboard ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Agency Dashboard is a project management and client tracking tool designed for agencies and freelancers. Features include project tracking, client management, task organization, invoicing, and calendar scheduling. The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            To access certain features of the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept all responsibility for all activity that occurs under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. User Data and Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We take your privacy seriously. All user data is encrypted and stored securely. Each user can only access their own data through row-level security policies. We do not sell, trade, or share your personal information with third parties. For more details, please review our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any harmful, threatening, or objectionable content</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service and its original content, features, and functionality are owned by the Agency Dashboard team and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of all content you create using the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall the Agency Dashboard team be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@agency.com" className="text-primary hover:underline">
              legal@agency.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
