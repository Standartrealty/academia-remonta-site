const cityAliases = {
  махачкала: 'mahachkala',
  makhachkala: 'mahachkala',
  mahachkala: 'mahachkala',
  каспийск: 'kaspiysk',
  kaspiysk: 'kaspiysk',
  kaspiisk: 'kaspiysk',
  избербаш: 'izberbash',
  izberbash: 'izberbash'
};

export default function handler(req, res) {
  let city = '';
  try {
    city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '').trim().toLowerCase();
  } catch (_) {}
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ city: cityAliases[city] || null });
}
