// Server-side proxy: Eddy → B Things add-task API
// Keeps the B Things API key out of the client bundle
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const BTHINGS_API_KEY = process.env.BTHINGS_API_KEY
  if (!BTHINGS_API_KEY) return res.status(500).json({ error: 'BTHINGS_API_KEY not configured' })

  try {
    const resp = await fetch('https://things-app-gamma.vercel.app/api/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': BTHINGS_API_KEY },
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    return res.status(resp.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
