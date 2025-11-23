export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;
    // Validation basique
    if (!name || !email || !message) {
      return Response.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email invalide" }, { status: 400 });
    }
    // Log pour le moment (à remplacer par un service d'email)
    console.log("Contact form submission:", { name, email, message });
    return Response.json({ success: true, message: "Message reçu" });
  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}











