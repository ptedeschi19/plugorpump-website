const Joi = require('joi');

// Validation schema for questionnaire responses
const responseSchema = Joi.object({
  responses: Joi.object({
    drivingHabits: Joi.string().valid('city', 'highway', 'mixed').required(),
    dailyMiles: Joi.string().valid('under25', '25to50', '50to100', 'over100').required(),
    vehicleAge: Joi.string().valid('under3', '3to7', '7to12', 'over12').required(),
    fuelCosts: Joi.string().valid('under150', '150to300', '300to500', 'over500').required(),
    maintenanceFreq: Joi.string().valid('monthly', 'quarterly', 'biannual', 'annual', 'rarely').required(),
    maintenanceCosts: Joi.string().valid('under100', '100to300', '300to600', 'over600').required(),
    chargingAccess: Joi.string().valid('home', 'work', 'public', 'none').required(),
    purchaseBudget: Joi.string().valid('under30k', '30to50k', '50to70k', 'over70k').required(),
    vehicleType: Joi.string().valid('sedan', 'suv', 'truck', 'compact', 'luxury').required(),
    primaryUse: Joi.string().valid('commuting', 'family', 'business', 'recreation', 'delivery').required(),
    environmentalConcern: Joi.string().valid('very-important', 'somewhat', 'neutral', 'not-important').required(),
    techComfort: Joi.string().valid('early-adopter', 'comfortable', 'cautious', 'traditional').required(),
    incentivesInterest: Joi.string().valid('very-interested', 'somewhat', 'maybe', 'not-interested').required(),
    timelineDecision: Joi.string().valid('immediate', '3months', '6months', '1year', 'future').required(),
    currentSatisfaction: Joi.string().valid('very-satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very-unsatisfied').required()
  }).required(),
  
  userInfo: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).optional()
  }).required()
});

const validateSubmission = (req, res, next) => {
  const { error, value } = responseSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors
    });
  }
  
  req.body = value;
  next();
};

module.exports = {
  validateSubmission
};
