// Route de test pour vérifier que l'API fonctionne
export async function GET() {
  return Response.json({ 
    status: "ok", 
    message: "API RAG fonctionnelle",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return Response.json({ 
      status: "ok", 
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      status: "error", 
      error: error.message 
    }, { status: 500 });
  }
}

