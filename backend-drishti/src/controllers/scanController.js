import { aiService } from '../services/aiService.js';
import { StorageService } from '../services/storageService.js';
import { ScanModel } from '../models/scanModel.js';

export const createScan = async (req, res, next) => {
  try {
    let imageBuffer;
    let mimeType = 'image/jpeg';
    const mode = req.body.mode || 'general';
    const customPrompt = req.body.prompt || '';

    // Handle multipart upload or base64 string
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      const match = req.body.imageBase64.match(/^data:(image\/\w+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image provided. Please capture or upload an image.'
      });
    }

    // 1. Run AI Vision Analysis
    const analysis = await aiService.analyzeImage(imageBuffer, mimeType, mode, customPrompt);

    // 2. Upload image to Supabase Storage (with safe fallback)
    let imageUrl = null;
    try {
      imageUrl = await StorageService.uploadScanImage(imageBuffer, mimeType);
    } catch (e) {
      console.warn('Storage upload bypassed:', e.message);
    }

    // 3. Persist scan to Supabase database (with safe fallback)
    const userId = req.user ? req.user.id : null;
    let title = 'Visual Scan';
    if (mode === 'text') title = 'Text & Label Reading';
    else if (mode === 'currency') title = 'Currency Detection';
    else if (mode === 'hazard') title = 'Obstacle & Safety Check';
    else if (mode === 'object') title = customPrompt ? `Finder: ${customPrompt}` : 'Object Finder';
    else title = 'Scene Description';

    let savedScan = null;
    try {
      savedScan = await ScanModel.create({
        userId,
        mode,
        imageUrl,
        title,
        summary: analysis.summary,
        detailedAnalysis: analysis.detailedAnalysis,
        hazards: analysis.hazards,
        textContent: analysis.textContent,
        currencyDetails: analysis.currencyDetails,
        confidence: analysis.confidence,
        processingTimeMs: analysis.processingTimeMs,
      });
    } catch (dbErr) {
      console.warn('Database save warning (continuing with analysis response):', dbErr.message);
      savedScan = {
        id: 'local-' + Date.now(),
        user_id: userId,
        mode,
        image_url: imageUrl,
        title,
        summary: analysis.summary,
        detailed_analysis: analysis.detailedAnalysis,
        hazards: analysis.hazards,
        text_content: analysis.textContent,
        currency_details: analysis.currencyDetails,
        confidence: analysis.confidence,
        processing_time_ms: analysis.processingTimeMs,
        created_at: new Date().toISOString(),
      };
    }

    res.status(201).json({
      success: true,
      data: {
        ...savedScan,
        ...analysis,
        provider: analysis.provider,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getScans = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const limit = parseInt(req.query.limit, 10) || 50;

    const scans = await ScanModel.findByUserId(userId, limit);

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    next(error);
  }
};

export const getScanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scan = await ScanModel.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found.'
      });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    await ScanModel.deleteById(id, userId);

    res.json({
      success: true,
      message: 'Scan deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
