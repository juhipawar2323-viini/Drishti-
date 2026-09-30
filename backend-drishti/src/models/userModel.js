import { supabase } from '../config/supabase.js';

export const UserModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('drishti_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data || null;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('drishti_users')
      .select('id, email, name, role, preferences, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create({ email, passwordHash, name, role = 'user', preferences = {} }) {
    const defaultPreferences = {
      speechRate: 1.0,
      speechPitch: 1.0,
      highContrast: false,
      autoSpeak: true,
      defaultMode: 'general',
      ...preferences
    };

    const { data, error } = await supabase
      .from('drishti_users')
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          name: name.trim(),
          role,
          preferences: defaultPreferences,
        }
      ])
      .select('id, email, name, role, preferences, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async updatePreferences(id, preferences) {
    const { data, error } = await supabase
      .from('drishti_users')
      .update({
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, email, name, role, preferences, created_at')
      .single();

    if (error) throw error;
    return data;
  }
};
