// Route pour vérifier le mode (LIVE ou SAFE)

export async function GET() {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN;
  const mode = hfToken ? "LIVE" : "SAFE";
  
  return Response.json({ mode });
}

