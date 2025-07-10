// Data Collection and Analysis System for PlugOrPump
// Maps questionnaire responses to personalized report data

class VehicleAnalysisEngine {
    constructor() {
        // External data sources (in production, these would be API calls)
        this.electricityRates = {
            '80424': 0.12, // Basalt, CO
            '80301': 0.11, // Boulder, CO  
            '80202': 0.12, // Denver, CO
            '90210': 0.24, // Beverly Hills, CA
            '10001': 0.18, // New York, NY
            '60601': 0.13, // Chicago, IL
            '98101': 0.10, // Seattle, WA
            '78701': 0.11  // Austin, TX
        };

        this.gasPrices = {
            '80424': 3.45, // Basalt, CO
            '80301': 3.42, // Boulder, CO
            '80202': 3.45, // Denver, CO
            '90210': 4.85, // Beverly Hills, CA
            '10001': 3.65, // New York, NY
            '60601': 3.25, // Chicago, IL
            '98101': 4.20, // Seattle, WA
            '78701': 3.15  // Austin, TX
        };

        this.incentives = {
            federal: {
                evTaxCredit: 7500,
                usedEvCredit: 4000,
                incomeLimit: 300000
            },
            state: {
                'CO': { rebate: 2500, incomeLimit: 150000 },
                'CA': { rebate: 7500, incomeLimit: 120000 },
                'NY': { rebate: 2000, incomeLimit: null },
                'IL': { rebate: 4000, incomeLimit: 100000 },
                'WA': { rebate: 2500, incomeLimit: null },
                'TX': { rebate: 0, incomeLimit: null }
            }
        };

        this.vehicleDatabase = {
            sedan: {
                ev: [
                    { make: 'Tesla', model: 'Model 3', price: 42990, range: 272, efficiency: 4.2, cargo: 15 },
                    { make: 'Hyundai', model: 'IONIQ 6', price: 41600, range: 305, efficiency: 4.9, cargo: 11.2 },
                    { make: 'BMW', model: 'i4 eDrive40', price: 43900, range: 270, efficiency: 4.0, cargo: 13.2 }
                ],
                gas: [
                    { make: 'Toyota', model: 'Camry', price: 28400, mpg: 32, cargo: 15.1 },
                    { make: 'Honda', model: 'Accord', price: 27295, mpg: 33, cargo: 16.7 },
                    { make: 'Nissan', model: 'Altima', price: 25900, mpg: 34, cargo: 15.4 }
                ]
            },
            suv: {
                ev: [
                    { make: 'Tesla', model: 'Model Y', price: 47740, range: 330, efficiency: 3.8, cargo: 76 },
                    { make: 'Ford', model: 'Mustang Mach-E', price: 42895, range: 312, efficiency: 3.5, cargo: 59.7 },
                    { make: 'Hyundai', model: 'IONIQ 5', price: 41245, range: 303, efficiency: 3.9, cargo: 59.3 }
                ],
                gas: [
                    { make: 'Toyota', model: 'RAV4', price: 32425, mpg: 30, cargo: 69.8 },
                    { make: 'Honda', model: 'CR-V', price: 31200, mpg: 32, cargo: 75.8 },
                    { make: 'Mazda', model: 'CX-5', price: 29200, mpg: 28, cargo: 59.6 }
                ]
            }
        };
    }

    // Main analysis function
    analyzeUserResponses(responses) {
        const analysis = {
            userProfile: this.buildUserProfile(responses),
            costAnalysis: this.calculateCosts(responses),
            vehicleRecommendations: this.recommendVehicles(responses),
            localFactors: this.analyzeLocalFactors(responses),
            scenarios: this.runScenarios(responses),
            actionPlan: this.generateActionPlan(responses)
        };

        return analysis;
    }

    buildUserProfile(responses) {
        const zipCode = responses.q1;
        const state = this.getStateFromZip(zipCode);
        
        return {
            location: {
                zipCode: zipCode,
                state: state,
                city: this.getCityFromZip(zipCode)
            },
            driving: {
                annualMiles: parseInt(responses.q2),
                roadTrips: responses.q6,
                vehicleType: responses.q7
            },
            financial: {
                budget: parseInt(responses.q3),
                income: parseInt(responses.q8),
                financing: responses.q11,
                ownership: parseInt(responses.q12)
            },
            preferences: {
                priority: responses.q10,
                homeCharging: responses.q5,
                concerns: responses.q14,
                features: responses.q13 || []
            },
            timeline: responses.q9,
            currentVehicle: responses.q4,
            contact: responses.q15
        };
    }

    calculateCosts(responses) {
        const profile = this.buildUserProfile(responses);
        const years = profile.financial.ownership;
        const annualMiles = profile.driving.annualMiles;
        const zipCode = profile.location.zipCode;
        
        // Get local rates
        const electricityRate = this.electricityRates[zipCode] || 0.12;
        const gasPrice = this.gasPrices[zipCode] || 3.50;
        
        // Get vehicle recommendations for cost calculation
        const evVehicle = this.getBestEVMatch(profile);
        const gasVehicle = this.getBestGasMatch(profile);
        
        // Calculate EV costs
        const evPurchasePrice = evVehicle.price;
        const evFederalCredit = this.calculateFederalCredit(profile);
        const evStateRebate = this.calculateStateRebate(profile);
        const evNetPrice = evPurchasePrice - evFederalCredit - evStateRebate;
        
        const annualElectricity = (annualMiles / evVehicle.efficiency) * electricityRate;
        const evMaintenance = 720; // Annual EV maintenance
        const evInsurance = 1580; // Annual EV insurance (typically higher)
        
        const totalEvCost = evNetPrice + (annualElectricity * years) + 
                           (evMaintenance * years) + (evInsurance * years);
        
        // Calculate Gas costs
        const gasPurchasePrice = gasVehicle.price;
        const annualGas = (annualMiles / gasVehicle.mpg) * gasPrice;
        const gasMaintenance = 1200; // Annual gas maintenance
        const gasInsurance = 1460; // Annual gas insurance
        
        const totalGasCost = gasPurchasePrice + (annualGas * years) + 
                            (gasMaintenance * years) + (gasInsurance * years);
        
        const savings = totalGasCost - totalEvCost;
        const paybackMonths = evNetPrice > gasPurchasePrice ? 
                             ((evNetPrice - gasPurchasePrice) / ((annualGas + gasMaintenance) - (annualElectricity + evMaintenance)) * 12) : 0;
        
        return {
            ev: {
                vehicle: evVehicle,
                purchasePrice: evPurchasePrice,
                federalCredit: evFederalCredit,
                stateRebate: evStateRebate,
                netPrice: evNetPrice,
                annualElectricity: annualElectricity,
                annualMaintenance: evMaintenance,
                annualInsurance: evInsurance,
                totalCost: totalEvCost
            },
            gas: {
                vehicle: gasVehicle,
                purchasePrice: gasPurchasePrice,
                annualFuel: annualGas,
                annualMaintenance: gasMaintenance,
                annualInsurance: gasInsurance,
                totalCost: totalGasCost
            },
            comparison: {
                savings: savings,
                paybackMonths: Math.max(0, paybackMonths),
                recommendation: savings > 0 ? 'ev' : 'gas',
                confidenceScore: this.calculateConfidenceScore(profile, savings)
            }
        };
    }

    calculateFederalCredit(profile) {
        if (profile.financial.income > this.incentives.federal.incomeLimit) {
            return 0;
        }
        return this.incentives.federal.evTaxCredit;
    }

    calculateStateRebate(profile) {
        const stateIncentive = this.incentives.state[profile.location.state];
        if (!stateIncentive) return 0;
        
        if (stateIncentive.incomeLimit && profile.financial.income > stateIncentive.incomeLimit) {
            return 0;
        }
        
        return stateIncentive.rebate;
    }

    recommendVehicles(responses) {
        const profile = this.buildUserProfile(responses);
        const vehicleType = profile.driving.vehicleType;
        const budget = profile.financial.budget;
        
        const evOptions = this.vehicleDatabase[vehicleType]?.ev || this.vehicleDatabase.sedan.ev;
        const gasOptions = this.vehicleDatabase[vehicleType]?.gas || this.vehicleDatabase.sedan.gas;
        
        // Filter by budget and sort by value
        const affordableEVs = evOptions
            .filter(v => v.price <= budget + 10000) // Allow some buffer for EVs due to incentives
            .sort((a, b) => this.scoreVehicle(b, profile) - this.scoreVehicle(a, profile))
            .slice(0, 3);
            
        const affordableGas = gasOptions
            .filter(v => v.price <= budget)
            .sort((a, b) => this.scoreVehicle(b, profile) - this.scoreVehicle(a, profile))
            .slice(0, 3);
        
        return {
            ev: affordableEVs,
            gas: affordableGas,
            recommended: affordableEVs[0] || evOptions[0]
        };
    }

    scoreVehicle(vehicle, profile) {
        let score = 0;
        
        // Budget fit
        if (vehicle.price <= profile.financial.budget) score += 20;
        
        // Feature preferences
        if (profile.preferences.features.includes('efficiency') && vehicle.efficiency) {
            score += vehicle.efficiency * 2;
        }
        if (profile.preferences.features.includes('cargo') && vehicle.cargo) {
            score += vehicle.cargo * 0.5;
        }
        if (profile.preferences.features.includes('performance')) {
            score += 10; // Would need performance metrics
        }
        
        // Range considerations for EVs
        if (vehicle.range) {
            if (profile.driving.roadTrips === 'never') score += 5;
            if (profile.driving.roadTrips === 'weekly') score -= 5;
            if (vehicle.range > 300) score += 10;
        }
        
        return score;
    }

    getBestEVMatch(profile) {
        const recommendations = this.recommendVehicles({ 
            q1: profile.location.zipCode,
            q2: profile.driving.annualMiles.toString(),
            q3: profile.financial.budget.toString(),
            q7: profile.driving.vehicleType,
            q8: profile.financial.income.toString(),
            q10: profile.preferences.priority,
            q13: profile.preferences.features
        });
        return recommendations.ev[0] || this.vehicleDatabase.sedan.ev[0];
    }

    getBestGasMatch(profile) {
        const recommendations = this.recommendVehicles({ 
            q1: profile.location.zipCode,
            q2: profile.driving.annualMiles.toString(),
            q3: profile.financial.budget.toString(),
            q7: profile.driving.vehicleType
        });
        return recommendations.gas[0] || this.vehicleDatabase.sedan.gas[0];
    }

    analyzeLocalFactors(responses) {
        const profile = this.buildUserProfile(responses);
        const zipCode = profile.location.zipCode;
        const state = profile.location.state;
        
        return {
            electricity: {
                rate: this.electricityRates[zipCode] || 0.12,
                timeOfUseAvailable: true,
                offPeakRate: (this.electricityRates[zipCode] || 0.12) * 0.67
            },
            gas: {
                currentPrice: this.gasPrices[zipCode] || 3.50,
                historicalRange: [2.85, 4.20],
                projectedTrend: 'gradual increase'
            },
            charging: {
                dcFastChargers: this.getChargingInfrastructure(zipCode).dcFast,
                level2Chargers: this.getChargingInfrastructure(zipCode).level2,
                homeChargingCost: this.estimateHomeChargingCost(profile)
            },
            incentives: {
                federal: this.calculateFederalCredit(profile),
                state: this.calculateStateRebate(profile),
                utility: this.getUtilityIncentives(state),
                local: this.getLocalIncentives(zipCode)
            },
            climate: {
                winterImpact: this.getClimateImpact(state),
                gridCleanness: this.getGridCleanness(state)
            }
        };
    }

    runScenarios(responses) {
        const baseAnalysis = this.calculateCosts(responses);
        const profile = this.buildUserProfile(responses);
        
        // Gas price scenarios
        const gasScenarios = [3.00, 4.00, 5.00].map(price => {
            const scenario = { ...responses };
            return {
                gasPrice: price,
                savings: this.calculateSavingsWithGasPrice(profile, price)
            };
        });
        
        // Mileage scenarios
        const mileageScenarios = [8000, 12000, 16000].map(miles => {
            const scenario = { ...responses, q2: miles.toString() };
            return {
                mileage: miles,
                savings: this.calculateCosts(scenario).comparison.savings
            };
        });
        
        // Electricity rate scenarios
        const electricityScenarios = [0.08, 0.12, 0.16].map(rate => {
            return {
                rate: rate,
                savings: this.calculateSavingsWithElectricityRate(profile, rate)
            };
        });
        
        return {
            gasPrice: gasScenarios,
            mileage: mileageScenarios,
            electricity: electricityScenarios,
            incentiveExpiration: this.calculateWithoutIncentives(profile)
        };
    }

    generateActionPlan(responses) {
        const profile = this.buildUserProfile(responses);
        const analysis = this.calculateCosts(responses);
        const actions = [];
        
        // High priority actions
        if (analysis.comparison.recommendation === 'ev') {
            actions.push({
                priority: 'HIGH',
                title: 'Research Federal Tax Credit Timing',
                description: 'The $7,500 federal tax credit may expire September 30, 2025. Ensure you can claim it on your 2025 tax return.',
                category: 'incentives'
            });
            
            if (profile.preferences.homeCharging !== 'none') {
                actions.push({
                    priority: 'HIGH',
                    title: 'Get Home Charging Assessment',
                    description: 'Contact 3 electricians for quotes on 240V outlet installation. Budget $800-$1,200 for installation.',
                    category: 'infrastructure'
                });
            }
        }
        
        // Medium priority actions
        actions.push({
            priority: 'MEDIUM',
            title: 'Test Drive Recommended Vehicles',
            description: `Schedule test drives for ${analysis.ev.vehicle.make} ${analysis.ev.vehicle.model} and comparable options. Focus on range and comfort for your typical drives.`,
            category: 'research'
        });
        
        actions.push({
            priority: 'MEDIUM',
            title: 'Check Insurance Rates',
            description: 'Get quotes from 3 insurers for your top vehicle choices. EV insurance can be 10-20% higher than gas vehicles.',
            category: 'financial'
        });
        
        // Low priority actions
        if (analysis.comparison.recommendation === 'ev') {
            actions.push({
                priority: 'LOW',
                title: 'Plan Charging Strategy',
                description: 'Download PlugShare app and identify public charging locations for longer trips. Consider signing up for time-of-use electricity rates.',
                category: 'planning'
            });
        }
        
        actions.push({
            priority: 'LOW',
            title: 'Time Your Purchase',
            description: this.getOptimalPurchaseTiming(profile),
            category: 'timing'
        });
        
        return actions;
    }

    // Helper methods
    calculateConfidenceScore(profile, savings) {
        let confidence = 50; // Base confidence
        
        // Increase confidence for clear savings
        if (Math.abs(savings) > 5000) confidence += 20;
        if (Math.abs(savings) > 10000) confidence += 15;
        
        // Adjust for user factors
        if (profile.preferences.homeCharging === 'garage') confidence += 10;
        if (profile.preferences.homeCharging === 'none') confidence -= 15;
        if (profile.driving.roadTrips === 'never') confidence += 10;
        if (profile.driving.roadTrips === 'weekly') confidence -= 10;
        
        return Math.min(95, Math.max(60, confidence));
    }

    getStateFromZip(zipCode) {
        const zipToState = {
            '80424': 'CO', '80301': 'CO', '80202': 'CO',
            '90210': 'CA', '10001': 'NY', '60601': 'IL',
            '98101': 'WA', '78701': 'TX'
        };
        return zipToState[zipCode] || 'CO';
    }

    getCityFromZip(zipCode) {
        const zipToCity = {
            '80424': 'Basalt', '80301': 'Boulder', '80202': 'Denver',
            '90210': 'Beverly Hills', '10001': 'New York', '60601': 'Chicago',
            '98101': 'Seattle', '78701': 'Austin'
        };
        return zipToCity[zipCode] || 'Unknown';
    }

    getChargingInfrastructure(zipCode) {
        // Simplified - would use real APIs like PlugShare or NREL
        const infrastructure = {
            '80424': { dcFast: 12, level2: 45 },
            '80202': { dcFast: 47, level2: 156 },
            '90210': { dcFast: 89, level2: 234 },
            '10001': { dcFast: 156, level2: 445 }
        };
        return infrastructure[zipCode] || { dcFast: 25, level2: 85 };
    }

    estimateHomeChargingCost(profile) {
        if (profile.preferences.homeCharging === 'garage') return 1000;
        if (profile.preferences.homeCharging === 'driveway') return 1500;
        if (profile.preferences.homeCharging === 'limited') return 2500;
        return 0;
    }

    getUtilityIncentives(state) {
        const utilityIncentives = {
            'CO': 1000, 'CA': 1500, 'NY': 500, 'WA': 750, 'TX': 0, 'IL': 800
        };
        return utilityIncentives[state] || 500;
    }

    getLocalIncentives(zipCode) {
        // Simplified local incentive mapping
        const localIncentives = {
            '80202': 500, // Denver
            '90210': 1000, // Beverly Hills
            '10001': 750, // NYC
            '98101': 1200 // Seattle
        };
        return localIncentives[zipCode] || 0;
    }

    getClimateImpact(state) {
        const climateData = {
            'CO': { winterReduction: '15-20%', heating: true },
            'CA': { winterReduction: '5-10%', heating: false },
            'NY': { winterReduction: '20-25%', heating: true },
            'WA': { winterReduction: '10-15%', heating: false },
            'TX': { winterReduction: '5%', heating: false },
            'IL': { winterReduction: '20-25%', heating: true }
        };
        return climateData[state] || { winterReduction: '15%', heating: true };
    }

    getGridCleanness(state) {
        const gridData = {
            'CO': 32, 'CA': 45, 'NY': 28, 'WA': 89, 'TX': 22, 'IL': 15
        };
        return gridData[state] || 30;
    }

    calculateSavingsWithGasPrice(profile, gasPrice) {
        // Simplified calculation - would use full cost analysis
        const annualMiles = profile.driving.annualMiles;
        const years = profile.financial.ownership;
        const avgMpg = 30;
        const electricityRate = this.electricityRates[profile.location.zipCode] || 0.12;
        const avgEfficiency = 4.0;
        
        const annualGasCost = (annualMiles / avgMpg) * gasPrice;
        const annualElectricityCost = (annualMiles / avgEfficiency) * electricityRate;
        
        return (annualGasCost - annualElectricityCost) * years;
    }

    calculateWithoutIncentives(profile) {
        // Calculate costs without any incentives
        const withIncentives = this.calculateCosts({
            q1: profile.location.zipCode,
            q2: profile.driving.annualMiles.toString(),
            q3: profile.financial.budget.toString(),
            q8: profile.financial.income.toString(),
            q12: profile.financial.ownership.toString()
        });

        // Calculate without federal incentives
        const withoutFederal = { ...withIncentives };
        withoutFederal.ev.federalCredit = 0;
        withoutFederal.ev.netPrice = withoutFederal.ev.purchasePrice - withoutFederal.ev.stateRebate;
        withoutFederal.ev.totalCost = withoutFederal.ev.netPrice + 
            (withoutFederal.ev.annualElectricity * profile.financial.ownership) +
            (withoutFederal.ev.annualMaintenance * profile.financial.ownership) +
            (withoutFederal.ev.annualInsurance * profile.financial.ownership);
        withoutFederal.comparison.savings = withoutFederal.gas.totalCost - withoutFederal.ev.totalCost;

        // Calculate without any incentives
        const withoutAny = { ...withIncentives };
        withoutAny.ev.federalCredit = 0;
        withoutAny.ev.stateRebate = 0;
        withoutAny.ev.netPrice = withoutAny.ev.purchasePrice;
        withoutAny.ev.totalCost = withoutAny.ev.netPrice + 
            (withoutAny.ev.annualElectricity * profile.financial.ownership) +
            (withoutAny.ev.annualMaintenance * profile.financial.ownership) +
            (withoutAny.ev.annualInsurance * profile.financial.ownership);
        withoutAny.comparison.savings = withoutAny.gas.totalCost - withoutAny.ev.totalCost;

        return {
            withIncentives: withIncentives.comparison.savings,
            withoutFederal: withoutFederal.comparison.savings,
            withoutAny: withoutAny.comparison.savings
        };
    }

    getOptimalPurchaseTiming(profile) {
        const timeline = profile.timeline;
        const incentiveExpiration = new Date('2025-09-30');
        const now = new Date();
        
        if (timeline === 'immediately' || timeline === 'soon') {
            return 'Optimal purchase timing: Within next 3 months to maximize incentive benefits and avoid potential expiration.';
        } else if (timeline === 'later') {
            return 'Optimal purchase timing: March-May 2025 to maximize incentive benefits before potential expiration.';
        } else {
            return 'Consider accelerating timeline to 2025 to capture current incentive levels before potential changes.';
        }
    }

    // Report data mapping function
    mapToReportData(analysisResults) {
        const { userProfile, costAnalysis, vehicleRecommendations, localFactors, scenarios, actionPlan } = analysisResults;
        
        return {
            // Client information
            clientInfo: {
                name: userProfile.contact.firstName + ' ' + (userProfile.contact.lastName || ''),
                location: `${localFactors.climate.city || userProfile.location.city}, ${userProfile.location.state}`,
                reportDate: new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                analysisPeriod: `${userProfile.financial.ownership} Years`
            },

            // Executive summary
            recommendation: {
                type: costAnalysis.comparison.recommendation === 'ev' ? 'Electric Vehicle' : 'Gas Vehicle',
                savings: Math.abs(costAnalysis.comparison.savings),
                paybackPeriod: costAnalysis.comparison.paybackMonths,
                confidenceScore: costAnalysis.comparison.confidenceScore
            },

            // Cost analysis
            costs: {
                ev: {
                    purchasePrice: costAnalysis.ev.purchasePrice,
                    federalCredit: costAnalysis.ev.federalCredit,
                    stateRebate: costAnalysis.ev.stateRebate,
                    netPrice: costAnalysis.ev.netPrice,
                    fuelCosts: costAnalysis.ev.annualElectricity * userProfile.financial.ownership,
                    maintenanceCosts: costAnalysis.ev.annualMaintenance * userProfile.financial.ownership,
                    insuranceCosts: costAnalysis.ev.annualInsurance * userProfile.financial.ownership,
                    totalCost: costAnalysis.ev.totalCost
                },
                gas: {
                    purchasePrice: costAnalysis.gas.purchasePrice,
                    fuelCosts: costAnalysis.gas.annualFuel * userProfile.financial.ownership,
                    maintenanceCosts: costAnalysis.gas.annualMaintenance * userProfile.financial.ownership,
                    insuranceCosts: costAnalysis.gas.annualInsurance * userProfile.financial.ownership,
                    totalCost: costAnalysis.gas.totalCost
                }
            },

            // Vehicle recommendations
            vehicles: {
                recommended: vehicleRecommendations.recommended,
                evOptions: vehicleRecommendations.ev,
                gasOptions: vehicleRecommendations.gas
            },

            // Local market factors
            market: {
                electricityRate: localFactors.electricity.rate,
                gasPrice: localFactors.gas.currentPrice,
                chargingInfrastructure: {
                    dcFast: localFactors.charging.dcFastChargers,
                    level2: localFactors.charging.level2Chargers
                },
                incentives: {
                    federal: localFactors.incentives.federal,
                    state: localFactors.incentives.state,
                    utility: localFactors.incentives.utility,
                    local: localFactors.incentives.local
                },
                climate: localFactors.climate,
                homeChargingCost: localFactors.charging.homeChargingCost
            },

            // Scenarios
            scenarios: scenarios,

            // Action plan
            actions: actionPlan
        };
    }
}

// Usage example and data processor
class ReportDataProcessor {
    constructor() {
        this.analysisEngine = new VehicleAnalysisEngine();
    }

    // Process questionnaire responses into report data
    processQuestionnaire(questionnaireResponses) {
        try {
            // Run the analysis
            const analysisResults = this.analysisEngine.analyzeUserResponses(questionnaireResponses);
            
            // Map to report format
            const reportData = this.analysisEngine.mapToReportData(analysisResults);
            
            // Add metadata
            reportData.metadata = {
                generatedAt: new Date().toISOString(),
                version: '1.0',
                analysisEngine: 'PlugOrPump Analysis Engine v1.0'
            };

            return reportData;
        } catch (error) {
            console.error('Error processing questionnaire:', error);
            throw new Error('Failed to process questionnaire data');
        }
    }

    // Validate questionnaire responses
    validateResponses(responses) {
        const required = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q14', 'q15'];
        const missing = required.filter(q => !responses[q]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required responses: ${missing.join(', ')}`);
        }

        // Validate specific fields
        if (!/^\d{5}$/.test(responses.q1)) {
            throw new Error('Invalid ZIP code format');
        }

        if (!responses.q15.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses.q15.email)) {
            throw new Error('Invalid email address');
        }

        return true;
    }

    // Generate sample data for testing
    generateSampleData() {
        const sampleResponses = {
            q1: '80202', // Denver, CO
            q2: '12000', // Annual mileage
            q3: '45000', // Budget
            q4: { make: 'Honda', model: 'Civic', year: '2018', mileage: '65000' },
            q5: 'garage', // Home charging
            q6: 'few', // Road trips
            q7: 'sedan', // Vehicle type
            q8: '75000', // Income
            q9: 'soon', // Timeline
            q10: 'cost', // Priority
            q11: 'finance', // Financing
            q12: '5', // Ownership duration
            q13: ['efficiency', 'cargo'], // Features
            q14: 'range', // Concerns
            q15: { firstName: 'John', email: 'john@example.com' }
        };

        return this.processQuestionnaire(sampleResponses);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VehicleAnalysisEngine, ReportDataProcessor };
}

// Example usage:
/*
const processor = new ReportDataProcessor();

// Process real questionnaire data
const questionnaireData = {
    q1: '80202',
    q2: '12000',
    // ... all other responses
};

try {
    processor.validateResponses(questionnaireData);
    const reportData = processor.processQuestionnaire(questionnaireData);
    
    // reportData now contains all the structured data needed for the report template
    console.log('Report data generated successfully:', reportData);
    
    // This data can now be passed to the PDF generation system
    // generatePDFReport(reportData);
    
} catch (error) {
    console.error('Error generating report:', error.message);
}

// Generate sample data for testing
const sampleData = processor.generateSampleData();
console.log('Sample report data:', sampleData);
*/ * years;
    }

    calculateSavingsWithElectricityRate(profile, electricityRate) {
        const annualMiles = profile.driving.annualMiles;
        const years = profile.financial.ownership;
        const avgMpg = 30;
        const gasPrice = this.gasPrices[profile.location.zipCode] || 3.50;
        const avgEfficiency = 4.0;
        
        const annualGasCost = (annualMiles / avgMpg) * gasPrice;
        const annualElectricityCost = (annualMiles / avgEfficiency) * electricityRate;
        
        return (annualGasCost - annualElectricityCost)