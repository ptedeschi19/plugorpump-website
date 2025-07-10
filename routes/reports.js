const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const { validateSubmission } = require('../middleware/validation');
const { generateReport } = require('../services/reportGenerator');
const { sendReportEmail } = require('../services/emailService');
const { VehicleAnalysisEngine, ReportDataProcessor } = require('../services/analysisEngine');

// POST /api/reports/generate
router.post('/generate', validateSubmission, async (req, res) => {
  try {
    const { responses, userInfo } = req.body;
    
    // Generate unique report ID
    const reportId = uuidv4();
    
    console.log(`Generating report ${reportId} for ${userInfo.email}`);
    
    // Initialize analysis engine with responses
    const analysisEngine = new VehicleAnalysisEngine(responses);
    const analysis = analysisEngine.performAnalysis();
    
    // Process data for report
    const reportProcessor = new ReportDataProcessor(responses, analysis);
    const reportData = reportProcessor.generateReportData();
    
    // Add user info and metadata
    reportData.userInfo = userInfo;
    reportData.reportId = reportId;
    reportData.generatedAt = new Date().toISOString();
    
    // Generate PDF report
    const pdfBuffer = await generateReport(reportData);
    
    // Send email with PDF attachment
    await sendReportEmail({
      to: userInfo.email,
      userInfo,
      reportData,
      pdfBuffer,
      reportId
    });
    
    console.log(`Report ${reportId} generated and emailed successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Report generated and sent successfully',
      reportId: reportId,
      summary: {
        recommendation: reportData.recommendation,
        totalCostSavings: reportData.analysis.totalCostSavings,
        paybackPeriod: reportData.analysis.paybackPeriod
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// GET /api/reports/test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Reports API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
