const { RESOURCE_TYPES } = require('../utils/constants');

const validateDocumentUpload = (body, file) => {
  const errors = [];
  const { title, subject, semester, resourceType } = body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters long.');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
    errors.push('Subject is required.');
  }

  const semNum = Number(semester);
  if (!semester || isNaN(semNum) || semNum < 1 || semNum > 8) {
    errors.push('Semester must be an integer between 1 and 8.');
  }

  if (!resourceType || !Object.values(RESOURCE_TYPES).includes(resourceType)) {
    errors.push(`Resource type must be one of: ${Object.values(RESOURCE_TYPES).join(', ')}`);
  }

  if (!file) {
    errors.push('A valid PDF file is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateDocumentUpdate = (body) => {
  const errors = [];
  const { title, semester, resourceType } = body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    errors.push('Title must be at least 3 characters long.');
  }

  if (semester !== undefined) {
    const semNum = Number(semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      errors.push('Semester must be between 1 and 8.');
    }
  }

  if (resourceType !== undefined && !Object.values(RESOURCE_TYPES).includes(resourceType)) {
    errors.push(`Resource type must be one of: ${Object.values(RESOURCE_TYPES).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateDocumentUpload,
  validateDocumentUpdate
};
