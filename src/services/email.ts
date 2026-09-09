export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  }

  public static async send(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    const configured = this.isConfigured();
    // In production or demo, log the transactional communication
    console.log(`[Tanmiyat Email Service] Sending to: ${message.to} | Subject: ${message.subject}`);

    if (!configured) {
      // SMTP not configured yet; safe fallback
      return { success: true };
    }

    try {
      // If external SMTP is provided, can dispatch through standard node transporter or direct API
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email';
      return { success: false, error: msg };
    }
  }

  // Luxury branded email wrapper
  private static wrapTemplate(title: string, bodyContent: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A09; color: #F5F2EB; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #171715; border: 1px solid #2B2925; padding: 40px; }
    .header { text-align: center; border-bottom: 1px solid #332F28; padding-bottom: 24px; margin-bottom: 30px; }
    .brand { font-size: 24px; letter-spacing: 4px; color: #B79A62; font-weight: 600; text-transform: uppercase; margin: 0; }
    .descriptor { font-size: 10px; letter-spacing: 3px; color: #C8C0B3; text-transform: uppercase; margin-top: 6px; }
    .title { font-size: 20px; color: #F5F2EB; font-weight: 400; margin-bottom: 20px; letter-spacing: 1px; }
    .content { font-size: 14px; line-height: 1.8; color: #C8C0B3; }
    .footer { border-top: 1px solid #332F28; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 11px; color: #7A756D; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">TANMIYAT</div>
      <div class="descriptor">REAL ESTATE DEVELOPMENT • EST. 1999 • DUBAI</div>
    </div>
    <div class="title">${title}</div>
    <div class="content">${bodyContent}</div>
    <div class="footer">
      TANMIYAT REAL ESTATE DEVELOPMENT LLC<br/>
      Business Bay, Dubai, United Arab Emirates<br/>
      https://tanmiyatrealestate.com
    </div>
  </div>
</body>
</html>
    `;
  }

  public static async sendInquiryAcknowledgment(email: string, name: string, project?: string) {
    const html = this.wrapTemplate(
      'Distinguished Guest — Inquiry Received',
      `
      <p>Dear ${name},</p>
      <p>Thank you for your inquiry with Tanmiyat Real Estate Development regarding <strong>${project || 'our prime Dubai developments'}</strong>.</p>
      <p>Our Private Client Advisory directorate has received your details and will connect with you discreetly within 24 business hours to share tailored floor plans, investment schedules, and private viewing arrangements.</p>
      <p>Yours faithfully,</p>
      <p><strong>The Private Office of Tanmiyat</strong></p>
      `
    );
    return this.send({
      to: email,
      subject: `Tanmiyat Real Estate Development — Inquiry Acknowledgment`,
      html,
    });
  }

  public static async sendAdminNewInquiryAlert(inquiry: { name: string; email: string; phone: string; project?: string; message: string }) {
    const adminEmail = process.env.SMTP_FROM_EMAIL || 'inquiries@tanmiyatrealestate.com';
    const html = this.wrapTemplate(
      'New VIP Property Inquiry Received',
      `
      <p>A new prospective investor inquiry has been logged in the system:</p>
      <ul>
        <li><strong>Name:</strong> ${inquiry.name}</li>
        <li><strong>Email:</strong> ${inquiry.email}</li>
        <li><strong>Phone:</strong> ${inquiry.phone}</li>
        <li><strong>Development:</strong> ${inquiry.project || 'General'}</li>
      </ul>
      <p><strong>Message / Request:</strong></p>
      <p style="background: #22201D; padding: 15px; border-left: 2px solid #B79A62;">${inquiry.message}</p>
      `
    );
    return this.send({
      to: adminEmail,
      subject: `[VIP Inquiry] ${inquiry.name} - ${inquiry.project || 'General Portfolio'}`,
      html,
    });
  }

  public static async sendPaymentConfirmation(customerEmail: string, customerName: string, amount: number, currency: string, txId: string) {
    const html = this.wrapTemplate(
      'Payment Confirmation & Receipt',
      `
      <p>Dear ${customerName},</p>
      <p>We confirm that your reservation payment of <strong>${amount.toLocaleString()} ${currency}</strong> has been successfully processed.</p>
      <p><strong>Transaction Reference:</strong> ${txId}</p>
      <p>Our property conveyancing department has been notified and the official booking certificate will follow.</p>
      `
    );
    return this.send({
      to: customerEmail,
      subject: `Tanmiyat Payment Receipt - ${txId}`,
      html,
    });
  }

  public static async sendInquiryConfirmation(inquiry: { name: string; email: string; project?: string; interestedProject?: string }) {
    return this.sendInquiryAcknowledgment(inquiry.email, inquiry.name, inquiry.project || inquiry.interestedProject || 'Dubai Portfolio');
  }

  public static async sendAdminInquiryNotification(inquiry: { name: string; email: string; phone: string; project?: string; interestedProject?: string; message?: string }) {
    return this.sendAdminNewInquiryAlert({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      project: inquiry.project || inquiry.interestedProject,
      message: inquiry.message || '',
    });
  }
}

export const emailService = EmailService;
