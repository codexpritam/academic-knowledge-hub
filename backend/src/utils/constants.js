module.exports = {
  PROCESSING_STATUS: {
    UPLOADING: 'UPLOADING',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    FAILED: 'FAILED'
  },

  RESOURCE_TYPES: {
    NOTES: 'NOTES',
    PYQ: 'PYQ',
    LAB_MANUAL: 'LAB_MANUAL',
    ASSIGNMENT: 'ASSIGNMENT',
    STUDY_MATERIAL: 'STUDY_MATERIAL',
    OTHER: 'OTHER'
  },

  USER_ROLES: {
    STUDENT: 'student'
  },

  GEMINI_MODELS: {
    GENERATION: 'gemini-3.8-flash',
    EMBEDDING: 'gemini-embedding-001'
  },

  VECTOR_INDEX_NAME: 'vector_index',

  VECTOR_DIMENSIONS: 768
};