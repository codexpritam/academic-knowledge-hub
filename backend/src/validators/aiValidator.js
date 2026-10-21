const validateAskQuestion = (body) => {
  const errors = [];
  const { question } = body;

  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    errors.push('Question must be at least 3 characters long.');
  } else if (question.trim().length > 1000) {
    errors.push('Question cannot exceed 1000 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateAskQuestion
};
