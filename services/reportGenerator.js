const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;

// Register Handlebars helpers
handlebars.registerHelper('currency', function(value) {
  return '$' + parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
});

handlebars.registerHelper('decimal', function(value, places = 1) {
  return parseFloat(value).toFixed(places);
});

handlebars.registerHelper('percentage', function(value) {
  return (parseFloat(value) * 100).toFixed(1) + '%';
});

handlebars.registerHelper('formatDate', function(date) {
  return moment(date).format('MMMM Do, YYYY');
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

const generateReport = async (reportData) => {
  let browser;
  
  try {
    console.log('Starting PDF generation...');
    
    // Get the HTML template
    const htmlTemplate = await getReportTemplate();
    const template = handlebars.compile(htmlTemplate);
    
    // Generate HTML content
    const htmlContent = template(reportData);
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set the content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    console.log('PDF generated successfully');
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const getReportTemplate = async () => {
  // If template file exists, use it; otherwise use the embedded template
  const templatePath = path.join(__dirname, '../templates/report.html');
  
  try {
    return await fs.readFile(templatePath, 'utf8');
  } catch (error) {
    // Return embedded template if file doesn't exist
    return getEmbeddedTemplate();
  }
};

const getEmbeddedTemplate = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Analysis Report - {{userInfo.name}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
        }
        
        .section {
            padding: 30px;
            margin-bottom: 20px;
        }
        
        .section h2 {
            color: #2c5aa0;
            font-size: 1.8em;
            margin-bottom: 20px;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 10px;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .summary-box h3 {
            font-size: 1.5em;
            margin-bottom: 15px;
        }
        
        .summary-box p {
            font-size: 1.1em;
            line-height: 1.5;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 5px;
        }
        
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .vehicle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .vehicle-card {
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 20px;
            background: #fff;
        }
        
        .vehicle-card h4 {
            color: #2c5aa0;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .vehicle-spec {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #f1f1f1;
        }
        
        .cost-comparison {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .cost-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .cost-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .cost-label {
            flex: 1;
        }
        
        .cost-ice {
            flex: 1;
            text-align: center;
            color: #dc3545;
        }
        
        .cost-ev {
            flex: 1;
            text-align: center;
            color: #28a745;
        }
        
        .action-items {
            background: #e8f4f8;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .action-items ul {
            list-style: none;
        }
        
        .action-items li {
            margin-bottom: 10px;
            padding-left: 25px;
            position: relative;
        }
        
        .action-items li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        
        .footer {
            background: #2c5aa0;
            color: white;
            padding: 20px;
            text-align: center;
            margin-top: 30px;
        }
        
        .disclaimer {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        @media print {
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PlugOrPump Vehicle Analysis Report</h1>
        <p>Personalized Analysis for {{userInfo.name}}</p>
        <p>Generated on {{formatDate generatedAt}}</p>
    </div>

    <div class="container">
        <!-- Executive Summary -->
        <div class="section">
            <div class="summary-box">
                <h3>{{recommendation.title}}</h3>
                <p>{{recommendation.summary}}</p>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="section">
            <h2>Financial Impact</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">{{currency analysis.annualSavings}}</div>
                    <div class="metric-label">Annual Savings</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{currency analysis.fiveYearSavings}}</div>
                    <div class="metric-label">5-Year Savings</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{decimal analysis.paybackPeriod}} years</div>
                    <div class="metric-label">Payback Period</div>
                </div>
            </div>
        </div>

        <!-- Cost Comparison -->
        <div class="section">
            <h2>Annual Cost Comparison</h2>
            <div class="cost-comparison">
                <div class="cost-row">
                    <div class="cost-label"><strong>Cost Category</strong></div>
                    <div class="cost-ice"><strong>Conventional Vehicle</strong></div>
                    <div class="cost-ev"><strong>Electric Vehicle</strong></div>
                </div>
                <div class="cost-row">
                    <div class="cost-label">Fuel/Electricity</div>
                    <div class="cost-ice">{{currency costs.ice.fuelCost}}</div>
                    <div class="cost-ev">{{currency costs.ev.electricityCost}}</div>
                </div>
                <div class="cost-row">
                    <div class="cost-label">Maintenance</div>
                    <div class="cost-ice">{{currency costs.ice.maintenanceCost}}</div>
                    <div class="cost-ev">{{currency costs.ev.maintenanceCost}}</div>
                </div>
                <div class="cost-row">
                    <div class="cost-label">Total Annual Operating Cost</div>
                    <div class="cost-ice">{{currency costs.ice.totalAnnualCost}}</div>
                    <div class="cost-ev">{{currency costs.ev.totalAnnualCost}}</div>
                </div>
            </div>
        </div>

        <!-- Vehicle Recommendations -->
        {{#if vehicles.electric}}
        <div class="section">
            <h2>Recommended Electric Vehicles</h2>
            <div class="vehicle-grid">
                {{#each vehicles.electric}}
                <div class="vehicle-card">
                    <h4>{{make}} {{model}}</h4>
                    <div class="vehicle-spec">
                        <span>Price:</span>
                        <span>{{currency price}}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span>Range:</span>
                        <span>{{range}} miles</span>
                    </div>
                    <div class="vehicle-spec">
                        <span>Efficiency:</span>
                        <span>{{efficiency}} mi/kWh</span>
                    </div>
                    {{#if cargo}}
                    <div class="vehicle-spec">
                        <span>Cargo:</span>
                        <span>{{cargo}} cu ft</span>
                    </div>
                    {{/if}}
                </div>
                {{/each}}
            </div>
        </div>
        {{/if}}

        {{#if vehicles.conventional}}
        <div class="section">
            <h2>Recommended Conventional Vehicles</h2>
            <div class="vehicle-grid">
                {{#each vehicles.conventional}}
                <div class="vehicle-card">
                    <h4>{{make}} {{model}}</h4>
                    <div class="vehicle-spec">
                        <span>Price:</span>
                        <span>{{currency price}}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span>MPG:</span>
                        <span>{{mpg}} mpg</span>
                    </div>
                    {{#if cargo}}
                    <div class="vehicle-spec">
                        <span>Cargo:</span>
                        <span>{{cargo}} cu ft</span>
                    </div>
                    {{/if}}
                </div>
                {{/each}}
            </div>
        </div>
        {{/if}}

        <!-- Your Profile -->
        <div class="section">
            <h2>Your Driving Profile</h2>
            <div class="vehicle-grid">
                <div class="vehicle-card">
                    <h4>Driving Pattern</h4>
                    <p>{{profile.drivingPattern}} driving</p>
                    <p>{{profile.dailyMileage}} miles per day</p>
                </div>
                <div class="vehicle-card">
                    <h4>Technology Comfort</h4>
                    <p>{{profile.techAdoption}} level</p>
                </div>
                <div class="vehicle-card">
                    <h4>Environmental Priority</h4>
                    <p>{{profile.environmentalPriority}}</p>
                </div>
                <div class="vehicle-card">
                    <h4>Budget Range</h4>
                    <p>Up to {{currency profile.budget}}</p>
                </div>
            </div>
        </div>

        <!-- Action Items -->
        <div class="section">
            <h2>Recommended Next Steps</h2>
            <div class="action-items">
                <ul>
                    {{#each actionItems}}
                    <li>{{this}}</li>
                    {{/each}}
                </ul>
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="section">
            <div class="disclaimer">
                <strong>Disclaimer:</strong> This report is based on the information you provided and current market data. 
                Actual costs and savings may vary based on driving habits, local prices, incentives, and other factors. 
                Please consult with automotive professionals and conduct your own research before making purchasing decisions.
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Report ID: {{reportId}}</p>
        <p>Generated by PlugOrPump.com | For questions, contact support@plugorpump.com</p>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateReport
};
