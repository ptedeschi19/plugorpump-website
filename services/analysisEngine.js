// Backend Analysis Engine - adapted from data_collection_system.js
// Handles vehicle analysis and report data processing for API

class VehicleAnalysisEngine {
    constructor(responses) {
        this.responses = responses;
        
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
                ice: [
                    { make: 'Honda', model: 'Accord', price: 26520, mpg: 32, cargo: 16.7 },
                    { make: 'Toyota', model: 'Camry', price: 25295, mpg: 35, cargo: 15.1 },
                    { make: 'Nissan', model: 'Altima', price: 24300, mpg: 34, cargo: 15.4 }
                ]
            },
            suv: {
                ev: [
                    { make: 'Tesla', model: 'Model Y', price: 47740, range: 330, efficiency: 3.5, cargo: 76 },
                    { make: 'Ford', model: 'Mustang Mach-E', price: 42995, range: 312, efficiency: 3.8, cargo: 59.7 },
                    { make: 'Hyundai', model: 'IONIQ 5', price: 41450, range: 303, efficiency: 3.9, cargo: 59.3 }
                ],
                ice: [
                    { make: 'Honda', model: 'CR-V', price: 26800, mpg: 31, cargo: 39.2 },
                    { make: 'Toyota', model: 'RAV4', price: 28300, mpg: 30, cargo: 37.5 },
                    { make: 'Mazda', model: 'CX-5', price: 27200, mpg: 28, cargo: 30.9 }
                ]
            },
            truck: {
                ev: [
                    { make: 'Ford', model: 'F-150 Lightning', price: 49995, range: 230, efficiency: 2.1, cargo: 52.8 },
                    { make: 'Rivian', model: 'R1T', price: 73000, range: 314, efficiency: 2.5, cargo: 54 },
                    { make: 'Chevrolet', model: 'Silverado EV', price: 71300, range: 450, efficiency: 2.8, cargo: 60 }
                ],
                ice: [
                    { make: 'Ford', model: 'F-150', price: 37900, mpg: 22, cargo: 52.8 },
                    { make: 'Chevrolet', model: 'Silverado', price: 36200, mpg: 23, cargo: 53.4 },
                    { make: 'Ram', model: '1500', price: 37390, mpg: 21, cargo: 54.7 }
                ]
            }
        };
    }

    performAnalysis() {
        // Map questionnaire responses to analysis parameters
        const dailyMiles = this.mapDailyMiles(this.responses.dailyMiles);
        const annualMiles = dailyMiles * 365;
        
        // Get vehicle recommendations
        const vehicleType = this.responses.vehicleType;
        const budget = this.mapBudget(this.responses.purchaseBudget);
        
        const evOptions = this.vehicleDatabase[vehicleType]?.ev || [];
        const iceOptions = this.vehicleDatabase[vehicleType]?.ice || [];
        
        // Filter by budget
        const affordableEVs = evOptions.filter(v => v.price <= budget);
        const affordableICE = iceOptions.filter(v => v.price <= budget);
        
        // Calculate costs
        const costAnalysis = this.calculateCosts(dailyMiles, annualMiles, affordableEVs, affordableICE);
        
        // Generate recommendations
        const recommendation = this.generateRecommendation(costAnalysis, this.responses);
        
        return {
            vehicleRecommendations: {
                ev: affordableEVs.slice(0, 3),
                ice: affordableICE.slice(0, 3)
            },
            costAnalysis,
            recommendation,
            userProfile: this.generateUserProfile()
        };
    }

    mapDailyMiles(range) {
        const mapping = {
            'under25': 20,
            '25to50': 37,
            '50to100': 75,
            'over100': 120
        };
        return mapping[range] || 50;
    }

    mapBudget(range) {
        const mapping = {
            'under30k': 30000,
            '30to50k': 50000,
            '50to70k': 70000,
            'over70k': 100000
        };
        return mapping[range] || 50000;
    }

    calculateCosts(dailyMiles, annualMiles, evOptions, iceOptions) {
        const gasPrice = 3.50; // Average gas price
        const electricityRate = 0.13; // Average electricity rate
        
        // ICE vehicle costs
        const avgICE = iceOptions[0] || { price: 35000, mpg: 28 };
        const iceFuelCost = (annualMiles / avgICE.mpg) * gasPrice;
        const iceMaintenanceCost = annualMiles * 0.08; // $0.08 per mile
        const iceTotalAnnualCost = iceFuelCost + iceMaintenanceCost;
        
        // EV costs
        const avgEV = evOptions[0] || { price: 45000, efficiency: 3.5 };
        const evElectricityCost = (annualMiles / avgEV.efficiency) * electricityRate;
        const evMaintenanceCost = annualMiles * 0.04; // $0.04 per mile
        const evTotalAnnualCost = evElectricityCost + evMaintenanceCost;
        
        // Calculate savings
        const annualSavings = iceTotalAnnualCost - evTotalAnnualCost;
        const fiveYearSavings = annualSavings * 5;
        const priceDifference = avgEV.price - avgICE.price;
        const paybackPeriod = priceDifference > 0 ? priceDifference / annualSavings : 0;
        
        return {
            ice: {
                fuelCost: iceFuelCost,
                maintenanceCost: iceMaintenanceCost,
                totalAnnualCost: iceTotalAnnualCost,
                vehiclePrice: avgICE.price
            },
            ev: {
                electricityCost: evElectricityCost,
                maintenanceCost: evMaintenanceCost,
                totalAnnualCost: evTotalAnnualCost,
                vehiclePrice: avgEV.price
            },
            comparison: {
                annualSavings,
                fiveYearSavings,
                paybackPeriod,
                priceDifference
            }
        };
    }

    generateRecommendation(costAnalysis, responses) {
        const { comparison } = costAnalysis;
        const envConcern = responses.environmentalConcern;
        const techComfort = responses.techComfort;
        const chargingAccess = responses.chargingAccess;
        
        // Decision logic
        if (comparison.annualSavings > 1000 && chargingAccess !== 'none') {
            return {
                type: 'strong_ev',
                title: 'Strong Electric Vehicle Recommendation',
                summary: 'Based on your driving patterns and preferences, an electric vehicle would provide significant cost savings and align with your goals.',
                confidence: 'high'
            };
        } else if (comparison.annualSavings > 0 && (envConcern === 'very-important' || envConcern === 'somewhat')) {
            return {
                type: 'moderate_ev',
                title: 'Moderate Electric Vehicle Recommendation',
                summary: 'An electric vehicle would provide moderate benefits for your situation and support your environmental goals.',
                confidence: 'medium'
            };
        } else if (chargingAccess === 'none' || techComfort === 'traditional') {
            return {
                type: 'ice_preferred',
                title: 'Internal Combustion Engine Recommendation',
                summary: 'Based on your charging access and preferences, a conventional vehicle may be the better choice at this time.',
                confidence: 'medium'
            };
        } else {
            return {
                type: 'neutral',
                title: 'Both Options Have Merit',
                summary: 'Both electric and conventional vehicles have advantages for your situation. Consider your priorities carefully.',
                confidence: 'low'
            };
        }
    }

    generateUserProfile() {
        return {
            drivingPattern: this.responses.drivingHabits,
            dailyMileage: this.mapDailyMiles(this.responses.dailyMiles),
            techAdoption: this.responses.techComfort,
            environmentalPriority: this.responses.environmentalConcern,
            budget: this.mapBudget(this.responses.purchaseBudget),
            chargingAccess: this.responses.chargingAccess
        };
    }
}

class ReportDataProcessor {
    constructor(responses, analysis) {
        this.responses = responses;
        this.analysis = analysis;
    }

    generateReportData() {
        return {
            // Executive Summary
            recommendation: this.analysis.recommendation,
            
            // Key Metrics
            analysis: {
                annualSavings: this.analysis.costAnalysis.comparison.annualSavings,
                fiveYearSavings: this.analysis.costAnalysis.comparison.fiveYearSavings,
                paybackPeriod: this.analysis.costAnalysis.comparison.paybackPeriod,
                totalCostSavings: this.analysis.costAnalysis.comparison.fiveYearSavings
            },
            
            // Vehicle Recommendations
            vehicles: {
                electric: this.analysis.vehicleRecommendations.ev,
                conventional: this.analysis.vehicleRecommendations.ice
            },
            
            // Cost Breakdown
            costs: this.analysis.costAnalysis,
            
            // User Profile
            profile: this.analysis.userProfile,
            
            // Original Responses
            responses: this.responses,
            
            // Charts Data
            charts: this.generateChartsData(),
            
            // Action Items
            actionItems: this.generateActionItems()
        };
    }

    generateChartsData() {
        const { ice, ev } = this.analysis.costAnalysis;
        
        return {
            annualCostComparison: {
                labels: ['Fuel/Electricity', 'Maintenance', 'Total Annual'],
                ice: [ice.fuelCost, ice.maintenanceCost, ice.totalAnnualCost],
                ev: [ev.electricityCost, ev.maintenanceCost, ev.totalAnnualCost]
            },
            fiveYearProjection: {
                years: [1, 2, 3, 4, 5],
                iceCumulative: Array.from({length: 5}, (_, i) => ice.totalAnnualCost * (i + 1)),
                evCumulative: Array.from({length: 5}, (_, i) => ev.totalAnnualCost * (i + 1))
            }
        };
    }

    generateActionItems() {
        const items = [];
        const { recommendation } = this.analysis;
        
        if (recommendation.type.includes('ev')) {
            items.push('Research electric vehicles in your price range');
            items.push('Investigate charging options for your home or workplace');
            items.push('Look into federal and state EV incentives');
            items.push('Schedule test drives of recommended electric vehicles');
        }
        
        if (this.responses.chargingAccess === 'none') {
            items.push('Explore public charging infrastructure in your area');
            items.push('Consider installing a home charging station');
        }
        
        items.push('Compare insurance costs for your vehicle options');
        items.push('Review your current vehicle\'s trade-in value');
        
        return items;
    }
}

module.exports = {
    VehicleAnalysisEngine,
    ReportDataProcessor
};
