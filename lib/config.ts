export const SYSTEM_CONFIG = {
  // Storage configuration
  storage: {
    maxStorageMB: 500, // System-wide max storage limit
    warningThreshold: 80, // Show warning at 80% usage
    criticalThreshold: 95, // Show critical alert at 95% usage
  },
  
  // Document upload configuration
  upload: {
    maxFileSizeMB: 10, // Max individual file size
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  
  // Other system configs can be added here
  app: {
    name: "MarineTracker Pro",
    version: "1.0.0",
  },
};