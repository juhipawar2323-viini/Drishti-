import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { config } from '../config/env.js';

class AIService {
  constructor() {
    this.provider = config.ai.provider || 'gemini';
    this.apiKey = config.ai.apiKey || '';
    this.model = config.ai.model || 'gemini-2.5-flash';
    this.apiUrl = config.ai.apiUrl || '';
  }

  setCredentials({ provider, apiKey, model, apiUrl }) {
    if (provider) this.provider = provider.toLowerCase();
    if (apiKey !== undefined) this.apiKey = apiKey.trim();
    if (model) this.model = model;
    if (apiUrl) this.apiUrl = apiUrl;
  }

  getCredentials() {
    return {
      provider: this.provider,
      hasKey: Boolean(this.apiKey && this.apiKey.length > 5),
      model: this.model,
      apiUrl: this.apiUrl
    };
  }

  /**
   * Builds prompt tailored for accessibility / visually impaired users
   */
  buildPrompt(mode = 'general', customPrompt = '') {
    const coreAccessibilityInstruction = `
You are Drishti, an AI visual accessibility assistant designed for blind and visually impaired individuals.
You must be precise, concise, and spoken aloud through Text-To-Speech.
Always speak with direct spatial orientation relative to the user ("directly in front of you", "to your left at waist level", "at 2 o'clock, 30 cm away").
`;

    switch (mode) {
      case 'general':
        return `${coreAccessibilityInstruction}
MODE: GENERAL SCENE, PEOPLE & LAYOUT SCANNER.
${customPrompt ? `User specifically asked: "${customPrompt}".` : ''}

You MUST explicitly detect, count, and describe:
1. PEOPLE INVENTORY:
   - State the EXACT number of people surrounded by or visible to the user.
   - If there are no people, explicitly say "0 people detected".
   - For every person: describe their relative position.
2. OBJECT INVENTORY:
   - Identify every distinct everyday item surrounded by or on the table/room: laptop, water bottle, phone, charger, cup, keys, mouse, keyboard, chair, backpack, notebook, etc.
   - State exactly how many of each object exist and their spatial location.
3. ROOM LAYOUT & NAVIGATION:
   - Describe whether the user is facing a desk, standing in an open hallway, living room, office, or outdoor sidewalk.
   - State if the walking path ahead is clear or blocked.

CRITICAL RULE: DO NOT repeat a generic sentence. ONLY describe what you ACTUALLY see in the image. Be extremely precise about counts.

Return PURE JSON with keys:
{
  "summary": "1-2 sentence spoken summary stating exact people count and main objects (e.g. 'You are surrounded by 2 people and 3 objects. 1 laptop is in front, ...')",
  "peopleCount": (number),
  "peopleDetails": ["Description of each person and position"],
  "objectsDetected": ["Laptop (in front)", "Water bottle (left)", "Phone charger (right)", etc.],
  "detailedAnalysis": "Complete descriptive narrative detailing the surrounding layout, people, and objects.",
  "hazards": ["Any obstacles or trip hazards, or empty array"],
  "confidence": 0.95
}`;

      case 'text':
        return `${coreAccessibilityInstruction}
MODE: READ TEXT, SIGNS, BOOK LABELS & MEDICINES.
CRITICAL TRUTHFULNESS RULE:
- Only report what is genuinely visible in the image.
- If you CANNOT see any text, medicine packaging, book, label, or sign in the image, you MUST say EXACTLY: "reading text in medicine and book cannot be seen." Do NOT say anything else.
- In that case, you MUST set:
  "summary": "reading text in medicine and book cannot be seen.",
  "textContent": "",
  "isMedicine": false,
  "medicineDetails": null,
  "detailedAnalysis": "reading text in medicine and book cannot be seen."
- If readable text IS present:
  - Just say whatever you are seeing. 
  - If medicine: extract brand name, dosage, expiry date (EXP), manufacturing date (MFG), batch number, and warnings.
  - If book: extract book title, author, chapter, and text.
  - If sign or packaging: extract all words verbatim in natural reading order.

Return PURE JSON with keys:
{
  "summary": "Spoken sentence stating the document/medicine type and main heading, OR 'reading text in medicine and book cannot be seen.' if no text exists",
  "textContent": "Full verbatim extracted text in natural reading order (empty string if no text)",
  "isMedicine": (boolean),
  "medicineDetails": {
    "name": "Medicine name or N/A",
    "dosage": "Dosage or N/A",
    "expiryDate": "Expiry date or N/A",
    "warnings": "Any warnings or N/A"
  } or null,
  "detailedAnalysis": "Categorized breakdown of the text, layout, and instructions, or 'reading text in medicine and book cannot be seen.'",
  "hazards": ["Any safety alerts or warning labels detected in the text"],
  "confidence": 0.95
}`;

      case 'currency':
        return `${coreAccessibilityInstruction}
MODE: CURRENCY IDENTIFICATION (INDIAN RUPEES & INTERNATIONAL).
Task: Identify every banknote or coin visible in the frame.
Specific rules for Indian Rupee (INR):
- Coins:
  - 1 Rupee Coin (Silver stainless steel, one rupee symbol or thumb)
  - 2 Rupee Coin (Silver stainless steel with ridges, 2 fingers/symbol)
  - 5 Rupee Coin (Nickel-brass or stainless steel, thick rim, numeral 5)
  - 10 Rupee Coin (Bi-metallic: golden center with silver outer ring)
  - 20 Rupee Coin (12-edged polygon shape, bi-metallic)
- Banknotes: 10, 20, 50, 100, 200, 500 Rupees.

CRITICAL RULE: You must accurately detect whether it is a 1 Rupee coin, 2 Rupee coin, 5 Rupee coin, etc. Read the coin face carefully. State the total value.

Return PURE JSON with keys:
{
  "summary": "Exact spoken announcement of note/coin denomination and count (e.g. 'One 5 Rupee coin detected. Total value is 5 Rupees.')",
  "currencyDetails": {
    "currency": "INR",
    "denomination": 5,
    "type": "Note" or "Coin",
    "count": 1,
    "totalValue": 5,
    "items": ["1x 5 Rupee Coin"],
    "colorAndMotif": "Details"
  },
  "detailedAnalysis": "Detailed condition and distinguishing features of the currency note or coin.",
  "hazards": [],
  "confidence": 0.95
}`;

      case 'hazard':
        return `${coreAccessibilityInstruction}
MODE: SAFETY ALERT & HAZARD DETECTION.
Task: Detect immediate dangers, obstacles, elevation changes, and trip hazards.
Check for:
1. Downward or upward stairs, steps, curbs, ramps.
2. Low-hanging objects at eye/head level.
3. Trip hazards on the ground: cables, open drawers, toys, rugs, wet floors.
4. Blocked doorways, moving vehicles, opening doors, construction barricades.
Urgency ratings: URGENT (within 1 meter), CAUTION (1 to 3 meters), or CLEAR PATH.

Return PURE JSON with keys:
{
  "summary": "Immediate urgent warning alert (e.g. 'Danger: 3 downward stairs detected 1.5 meters directly ahead. Handrail is on your right.' or 'Path is clear for 3 meters.')",
  "hazards": ["List of detected hazards with distance and direction"],
  "hazardLevel": "HIGH" | "MEDIUM" | "NONE",
  "recommendedAction": "Actionable guidance (e.g. 'Stop walking. Reach out your right hand to feel the railing.')",
  "detailedAnalysis": "Comprehensive safety assessment of floor surface, ground clearance, and hazards.",
  "confidence": 0.95
}`;

      case 'object':
        return `${coreAccessibilityInstruction}
MODE: OBJECT FINDER, CLOCK POSITION & WATCH TIME DETECTION.
User requested target object: "${customPrompt || 'clock, watch, keys, or phone'}"

CRITICAL TRUTHFULNESS & DETECTION RULES:
1. WATCH / CLOCK FACE TIME DETECTION:
   - If the user specifically shows a clock, wrist watch, wall clock, or digital clock:
     - Detect and announce the EXACT time shown on the clock/watch face.
2. OBJECT NOT VISIBLE:
   - If you are NOT seeing any type of clock or the requested object:
     - DO NOT guess or fabricate. 
     - You MUST say EXACTLY: "clock position cannot find" or "[Object] cannot find". Do not be judged by any other time frames. Just directly say this object cannot find.
     - You MUST set:
       "targetFound": false,
       "clockPosition": null,
       "estimatedDistance": null,
       "summary": "clock position cannot find.",
       "detailedAnalysis": "clock position cannot find."
3. OBJECT FOUND:
   - If the target object IS clearly visible in the image:
     - Set "targetFound": true
     - "clockPosition": (e.g., "10 o'clock")
     - "summary": (e.g. "Found: Your watch is at 10 o'clock, showing 10:15 AM.")

Return PURE JSON with keys:
{
  "summary": "Spoken location guide with clock position and distance, OR 'clock position cannot find.'",
  "targetFound": (boolean),
  "clockPosition": "10 o'clock" or null,
  "estimatedDistance": "30 cm" or null,
  "timeDetected": "10:15 AM" or null,
  "detailedAnalysis": "Clear description of where the hand should reach, or 'clock position cannot find.'",
  "hazards": ["Any objects to avoid when reaching"],
  "confidence": 0.95
}`;

      default:
        return this.buildPrompt('general', customPrompt);
    }
  }

  async analyzeImage(imageBuffer, mimeType = 'image/jpeg', mode = 'general', customPrompt = '') {
    const startTime = Date.now();
    const prompt = this.buildPrompt(mode, customPrompt);

    // If an API key is configured, execute live model call
    if (this.apiKey && this.apiKey.trim().length > 5) {
      try {
        if (this.provider === 'gemini') {
          return await this._callGemini(imageBuffer, mimeType, prompt, mode, startTime);
        } else {
          return await this._callOpenAICompatible(imageBuffer, mimeType, prompt, mode, startTime);
        }
      } catch (err) {
        console.error(`AI Provider (${this.provider}) error:`, err.message);
        return this._getFallbackResponse(mode, customPrompt, startTime, err.message);
      }
    }

    // When API key is not yet set, provide rich dynamic accessibility response matching user's requested domain
    return this._getFallbackResponse(mode, customPrompt, startTime);
  }

  async _callGemini(imageBuffer, mimeType, prompt, mode, startTime) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-pro-preview'];
    // Deduplicate candidate models
    const uniqueModels = [...new Set([this.model, ...candidateModels].filter(Boolean))];
    // Fallback if the user's custom model was invalid
    if (uniqueModels.length === 0) uniqueModels.push('gemini-1.5-pro');

    const genAI = new GoogleGenerativeAI(this.apiKey);
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    };
    const systemInstruction = "Always return valid, clean JSON without code fences or extra text.";

    let lastError = null;
    for (const modelName of uniqueModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          systemInstruction,
          prompt,
          imagePart
        ]);

        const rawResponse = result.response.text();
        const parsed = this._parseJSONResponse(rawResponse, mode);
        parsed.processingTimeMs = Date.now() - startTime;
        parsed.provider = `Google Gemini (${modelName})`;
        return parsed;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini attempt with model "${modelName}" failed:`, err.message);
        // Continue to try next candidate model
      }
    }

    throw lastError || new Error('All Gemini candidate vision models failed');
  }

  async _callOpenAICompatible(imageBuffer, mimeType, prompt, mode, startTime) {
    let endpoint = this.apiUrl;
    if (!endpoint) {
      if (this.provider === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
      else if (this.provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      else if (this.provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    }

    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:${mimeType || 'image/jpeg'};base64,${base64Image}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are Drishti, an AI accessibility vision assistant. Always respond with pure valid JSON.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUri } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200
    };

    const response = await axios.post(endpoint, payload, { headers, timeout: 35000 });
    const content = response.data?.choices?.[0]?.message?.content;
    const parsed = this._parseJSONResponse(content, mode);
    parsed.processingTimeMs = Date.now() - startTime;
    parsed.provider = `${this.provider.toUpperCase()} (${this.model})`;
    return parsed;
  }

  _parseJSONResponse(rawText, mode) {
    if (!rawText) throw new Error('Empty response from AI vision model');

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

    try {
      const parsed = JSON.parse(cleaned);
      return {
        summary: parsed.summary || 'Visual scene analyzed successfully.',
        detailedAnalysis: parsed.detailedAnalysis || parsed.summary || '',
        hazards: Array.isArray(parsed.hazards) ? parsed.hazards : (parsed.hazards ? [parsed.hazards] : []),
        textContent: parsed.textContent || '',
        currencyDetails: parsed.currencyDetails || null,
        peopleCount: parsed.peopleCount ?? (parsed.peopleDetails?.length || 0),
        objectsDetected: parsed.objectsDetected || [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
        mode
      };
    } catch {
      return {
        summary: cleaned.slice(0, 220).replace(/\n/g, ' '),
        detailedAnalysis: cleaned,
        hazards: mode === 'hazard' ? [cleaned.slice(0, 100)] : [],
        textContent: mode === 'text' ? cleaned : '',
        currencyDetails: null,
        peopleCount: 0,
        objectsDetected: [],
        confidence: 0.90,
        mode
      };
    }
  }

  _getFallbackResponse(mode, customPrompt, startTime, errorNote = '') {
    const processingTimeMs = Date.now() - startTime;
    let friendlyError = errorNote;

    if (errorNote) {
      if (errorNote.includes('API key not valid') || errorNote.includes('API_KEY_INVALID')) {
        friendlyError = 'The API key you provided in Settings is invalid. Please double-check your Google Gemini API key and try again.';
      } else if (errorNote.includes('404 Not Found')) {
        friendlyError = 'The selected AI model is not supported or not available for your API key. Please try a different model.';
      } else if (errorNote.includes('503 Service Unavailable') || errorNote.includes('high demand')) {
        friendlyError = 'Google Gemini servers are currently experiencing high demand. Please try again in a few moments.';
      } else if (errorNote.includes('fetch failed')) {
        friendlyError = 'Network connection failed. Google servers might be overloaded or unreachable. Please try again.';
      } else if (errorNote.includes('429 Too Many Requests')) {
        friendlyError = 'API Quota Exceeded. You have made too many requests too quickly for your current API key plan.';
      } else {
        // Strip out the ugly JSON blocks that Google API sometimes appends
        friendlyError = errorNote.replace(/\[\{.*?\}\]/g, '').trim();
      }
    }

    const errorMessage = friendlyError 
      ? `AI Error: ${friendlyError}` 
      : 'Error: No API key found. Please open settings and enter a valid Google Gemini API key to enable live camera scanning.';

    return {
      summary: errorMessage,
      detailedAnalysis: errorMessage,
      hazards: [],
      textContent: '',
      currencyDetails: null,
      peopleCount: 0,
      objectsDetected: [],
      confidence: 0,
      mode,
      provider: 'System Error',
      processingTimeMs
    };
  }
}

export const aiService = new AIService();
