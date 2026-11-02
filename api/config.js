export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  // Only the public, RLS-restricted key may leave the server.
  if (!url || !key) return res.status(503).json({error:'Online profiler er ikke konfigureret endnu.'});
  return res.status(200).json({url, key});
}
