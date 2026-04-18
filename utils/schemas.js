const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const listingCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(2000),
  image: Joi.object({ filename: Joi.string().optional(), url: Joi.string().uri().optional() }).optional(),
  price: Joi.number().min(0).required(),
  location: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional()
});

const listingUpdateSchema = listingCreateSchema.fork(['title','price'], (s) => s.optional());

const bookingCreateSchema = Joi.object({
  listingId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  totalPrice: Joi.number().min(0).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  listingCreateSchema,
  listingUpdateSchema,
  bookingCreateSchema
};
