import { body, validationResult } from "express-validator";

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateJob = [
  body("job_title").trim().notEmpty().withMessage("Job title is required"),
  body("company").optional().trim(),
  body("description").optional().trim(),
  body("location").optional().trim(),
  body("job_link").optional().trim().isURL().withMessage("Valid URL is required if provided"),
  validateResult
];

export const validateEvent = [
  body("title").trim().notEmpty().withMessage("Event title is required"),
  body("date").notEmpty().withMessage("Date is required"),
  body("description").optional().trim(),
  body("host").optional().trim(),
  body("time").optional().trim(),
  body("mode").optional().trim(),
  validateResult
];
