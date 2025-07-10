const { testEmailConnection, sendReportEmail } = require('./services/emailService');
const { generateReport } = require('./services/reportGenerator');
const { VehicleAnalysisEngine, ReportDataProcessor } = require('./services/analysisEngine');

async function testBackendComponents() {
    console.log('🧪 Testing PlugOrPump Backend Components\n');

    // Test 1: Email Service Connection
    console.log('1. Testing Email Service Connection...');
    try {
        const emailTest = await testEmailConnection();
        if (emailTest) {
            console.log('✅ Email service connection successful');
        } else {
            console.log('❌ Email service connection failed');
        }
    } catch (error) {
        console.log('❌ Email service error:', error.message);
    }

    // Test 2: Analysis Engine
    console.log('\n2. Testing Analysis Engine...');
    try {
        const testResponses = {
            drivingHabits: 'mixed',
            dailyMiles: '25to50',
            vehicleAge: '3to7',
            fuelCosts: '150to300',
            maintenanceFreq: 'quarterly',
            maintenanceCosts: '100to300',
            chargingAccess: 'home',
            purchaseBudget: '30to50k',
            vehicleType: 'sedan',
            primaryUse: 'commuting',
            environmentalConcern: 'very-important',
            techComfort: 'comfortable',
            incentivesInterest: 'very-interested',
            timelineDecision: '3months',
            currentSatisfaction: 'neutral'
        };

        const analysisEngine = new VehicleAnalysisEngine(testResponses);
        const analysis = analysisEngine.performAnalysis();
        
        console.log('✅ Analysis Engine working');
        console.log('   Recommendation:', analysis.recommendation.title);
        console.log('   Annual Savings:', `$${Math.round(analysis.costAnalysis.comparison.annualSavings)}`);
    } catch (error) {
        console.log('❌ Analysis Engine error:', error.message);
    }

    // Test 3: Report Data Processor
    console.log('\n3. Testing Report Data Processor...');
    try {
        const analysisEngine = new VehicleAnalysisEngine(testResponses);
        const analysis = analysisEngine.performAnalysis();
        
        const reportProcessor = new ReportDataProcessor(testResponses, analysis);
        const reportData = reportProcessor.generateReportData();
        
        console.log('✅ Report Data Processor working');
        console.log('   Action Items count:', reportData.actionItems.length);
        console.log('   Charts data available:', !!reportData.charts);
    } catch (error) {
        console.log('❌ Report Data Processor error:', error.message);
    }

    // Test 4: PDF Generation
    console.log('\n4. Testing PDF Generation...');
    try {
        const analysisEngine = new VehicleAnalysisEngine(testResponses);
        const analysis = analysisEngine.performAnalysis();
        const reportProcessor = new ReportDataProcessor(testResponses, analysis);
        const reportData = reportProcessor.generateReportData();
        
        // Add required fields
        reportData.userInfo = {
            name: 'Test User',
            email: 'test@example.com'
        };
        reportData.reportId = 'test-123';
        reportData.generatedAt = new Date().toISOString();

        const pdfBuffer = await generateReport(reportData);
        
        console.log('✅ PDF Generation working');
        console.log('   PDF size:', `${Math.round(pdfBuffer.length / 1024)}KB`);
    } catch (error) {
        console.log('❌ PDF Generation error:', error.message);
    }

    console.log('\n🏁 Component testing complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Configure your .env file with email credentials');
    console.log('   2. Start the server with: npm run dev');
    console.log('   3. Test the frontend integration');
}

// Run tests if this file is executed directly
if (require.main === module) {
    testBackendComponents().catch(console.error);
}

module.exports = { testBackendComponents };
