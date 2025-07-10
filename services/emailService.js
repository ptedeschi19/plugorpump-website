const nodemailer = require('nodemailer');
const moment = require('moment');

// Email service for sending PDF reports
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    const config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

    console.log('Email configuration:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user ? 'configured' : 'missing',
      pass: config.auth.pass ? 'configured' : 'missing'
    });

    return nodemailer.createTransporter(config);
  }

  async sendReportEmail({ to, userInfo, reportData, pdfBuffer, reportId }) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
      }

      const subject = `Your PlugOrPump Vehicle Analysis Report - ${reportData.recommendation.title}`;
      
      const htmlContent = this.generateEmailHTML(userInfo, reportData, reportId);
      const textContent = this.generateEmailText(userInfo, reportData, reportId);

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"PlugOrPump Analysis" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            filename: `PlugOrPump-Analysis-${reportId.slice(0, 8)}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      console.log(`Sending email to ${to}...`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  generateEmailHTML(userInfo, reportData, reportId) {
    const recommendation = reportData.recommendation;
    const savings = reportData.analysis.annualSavings;
    const generatedDate = moment().format('MMMM Do, YYYY');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .highlight {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .metrics {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            text-align: center;
        }
        .metric {
            flex: 1;
            padding: 15px;
            background: white;
            border-radius: 8px;
            margin: 0 5px;
            border: 1px solid #dee2e6;
        }
        .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
        .button {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Vehicle Analysis Report is Ready!</h1>
        <p>Personalized analysis for ${userInfo.name}</p>
    </div>

    <div class="content">
        <h2>Hello ${userInfo.name.split(' ')[0]},</h2>
        
        <p>Thank you for using PlugOrPump's vehicle analysis tool! We've completed your personalized analysis and your detailed report is attached to this email.</p>
        
        <div class="highlight">
            <h3>${recommendation.title}</h3>
            <p>${recommendation.summary}</p>
        </div>

        <h3>Key Findings:</h3>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">$${Math.round(savings).toLocaleString()}</div>
                <div class="metric-label">Annual Savings</div>
            </div>
            <div class="metric">
                <div class="metric-value">$${Math.round(reportData.analysis.fiveYearSavings).toLocaleString()}</div>
                <div class="metric-label">5-Year Savings</div>
            </div>
            <div class="metric">
                <div class="metric-value">${reportData.analysis.paybackPeriod.toFixed(1)} yrs</div>
                <div class="metric-label">Payback Period</div>
            </div>
        </div>

        <p><strong>What's in your report:</strong></p>
        <ul>
            <li>Detailed cost comparison between electric and conventional vehicles</li>
            <li>Personalized vehicle recommendations based on your needs</li>
            <li>Your unique driving profile and usage patterns</li>
            <li>Actionable next steps for your vehicle decision</li>
            <li>Financial projections and savings analysis</li>
        </ul>

        <p>Your comprehensive report is attached as a PDF. You can also visit our website for additional resources and tools:</p>
        
        <div style="text-align: center;">
            <a href="https://plugorpump.com" class="button">Visit PlugOrPump.com</a>
        </div>

        <p><strong>Questions?</strong> We're here to help! Reply to this email or contact us at support@plugorpump.com</p>
    </div>

    <div class="footer">
        <p>Report ID: ${reportId}</p>
        <p>Generated on ${generatedDate}</p>
        <p>© 2024 PlugOrPump. All rights reserved.</p>
        <p>This analysis is based on the information you provided and current market data.</p>
    </div>
</body>
</html>
    `;
  }

  generateEmailText(userInfo, reportData, reportId) {
    const recommendation = reportData.recommendation;
    const savings = reportData.analysis.annualSavings;
    const generatedDate = moment().format('MMMM Do, YYYY');

    return `
PlugOrPump Vehicle Analysis Report

Hello ${userInfo.name.split(' ')[0]},

Thank you for using PlugOrPump's vehicle analysis tool! Your personalized report is ready and attached to this email.

RECOMMENDATION: ${recommendation.title}
${recommendation.summary}

KEY FINDINGS:
- Annual Savings: $${Math.round(savings).toLocaleString()}
- 5-Year Savings: $${Math.round(reportData.analysis.fiveYearSavings).toLocaleString()}
- Payback Period: ${reportData.analysis.paybackPeriod.toFixed(1)} years

Your detailed PDF report includes:
- Cost comparison between electric and conventional vehicles
- Personalized vehicle recommendations
- Your driving profile analysis
- Actionable next steps
- Financial projections

Questions? Contact us at support@plugorpump.com or visit https://plugorpump.com

Report ID: ${reportId}
Generated: ${generatedDate}

© 2024 PlugOrPump. All rights reserved.
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error.message);
      return false;
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();

const sendReportEmail = async (emailData) => {
  return await emailService.sendReportEmail(emailData);
};

const testEmailConnection = async () => {
  return await emailService.testConnection();
};

module.exports = {
  sendReportEmail,
  testEmailConnection,
  EmailService
};
