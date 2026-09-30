import { supabase } from '../config/supabase.js';

export const ScanModel = {
  async create({
    userId = null,
    mode = 'general',
    imageUrl = null,
    title = 'Visual Scan',
    summary,
    detailedAnalysis = '',
    hazards = [],
    textContent = '',
    currencyDetails = null,
    confidence = 0.95,
    processingTimeMs = 0
  }) {
    const { data, error } = await supabase
      .from('drishti_scans')
      .insert([
        {
          user_id: userId,
          mode,
          image_url: imageUrl,
          title,
          summary,
          detailed_analysis: detailedAnalysis,
          hazards: hazards || [],
          text_content: textContent || '',
          currency_details: currencyDetails || {},
          confidence,
          processing_time_ms: processingTimeMs,
        }
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId, limit = 50) {
    let query = supabase
      .from('drishti_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('drishti_scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteById(id, userId = null) {
    let query = supabase
      .from('drishti_scans')
      .delete()
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  }
};
