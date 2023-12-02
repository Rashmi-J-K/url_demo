// pages/api/db.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { timestamp } = req.query;

  // Use timestamp to filter recent URLs
  const { data, error } = await supabase
    .from('tce_ppk')
    .select('*')
    .gte('created_at', timestamp);

  if (error) {
    return res.status(500).json({ error: 'Error fetching data from the database' });
  }

  res.status(200).json(data);
}
