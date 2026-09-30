import { supabase } from '../config/supabase.js';
import { config } from '../config/env.js';

export const StorageService = {
  /**
   * Upload an image buffer to Supabase Storage bucket
   * @param {Buffer} buffer - File buffer
   * @param {string} mimeType - e.g. image/jpeg, image/png
   * @param {string} filename - target filename
   * @returns {Promise<string>} Public URL of uploaded image or data URI fallback
   */
  async uploadScanImage(buffer, mimeType = 'image/jpeg', originalName = 'scan.jpg') {
    try {
      const ext = mimeType.split('/')[1] || 'jpg';
      const cleanExt = ext.replace('+xml', '');
      const uniqueName = `scans/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

      const { data, error } = await supabase.storage
        .from(config.supabase.storageBucket)
        .upload(uniqueName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error, using data URI fallback:', error.message);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      }

      const { data: publicUrlData } = supabase.storage
        .from(config.supabase.storageBucket)
        .getPublicUrl(uniqueName);

      return publicUrlData?.publicUrl || `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (err) {
      console.warn('StorageService exception, falling back to data URI:', err.message);
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
  }
};
