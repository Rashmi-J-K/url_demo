// pages/api/redirect/[shortUrl].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { shortUrl } = req.query;

  // Retrieve the original URL from the database using the short URL
  const { data, error } = await supabase
    .from('tce_ppk')
    .select('original_url')
    .eq('short_url', shortUrl)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Error fetching data from the database' });
  }

  // If the data is found, redirect; otherwise, return an error
  if (data) {
    // Use a relative path to handle redirection
    const redirectURL = data.original_url.replace(`http://${req.headers.host}`, '');
    res.writeHead(301, { Location: redirectURL });
    res.end();
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
}
