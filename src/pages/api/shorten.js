// pages/api/shorten.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { originalUrl } = req.body;

  // Simple logic to generate a random short URL
  const shortUrl = Math.random().toString(36).substr(2, 6);

  // Save the data to the database
  const { data, error } = await supabase
    .from('tce_ppk')
    .insert([{ original_url: originalUrl, short_url: shortUrl }]);

  if (error) {
    return res.status(500).json({ error: 'Error saving data to the database' });
  }

  res.status(200).json({ shortUrl });
}