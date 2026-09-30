import { aiService } from '../services/aiService.js';

export const getAIStatus = async (req, res, next) => {
  try {
    const info = aiService.getCredentials();
    res.json({
      success: true,
      data: {
        provider: info.provider,
        model: info.model,
        hasKey: info.hasKey,
        supportedModes: ['general', 'text', 'currency', 'hazard', 'object'],
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAIConfig = async (req, res, next) => {
  try {
    const { provider, apiKey, model, apiUrl } = req.body;
    aiService.setCredentials({ provider, apiKey, model, apiUrl });

    res.json({
      success: true,
      message: 'AI Configuration updated successfully.',
      data: aiService.getCredentials()
    });
  } catch (error) {
    next(error);
  }
};
