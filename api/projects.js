// Server-side proxy: fetch B Things project list
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const BTHINGS_API_KEY = process.env.BTHINGS_API_KEY
  if (!BTHINGS_API_KEY) return res.status(500).json({ error: 'BTHINGS_API_KEY not configured' })

  try {
    const resp = await fetch(`https://things-app-gamma.vercel.app/api/projects?apiKey=${BTHINGS_API_KEY}`)
    const data = await resp.json()
    return res.status(resp.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
