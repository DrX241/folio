"use client";
import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const quickPrompts = [
    "Pourquoi te choisir, toi, pour mon besoin d'expertise et de coordination IA ?"
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour et bienvenue. Je suis Eddy MISSONI, Tech Lead IA. Si vous êtes recruteur, je peux vous présenter en quelques messages mon positionnement, mes résultats (gouvernance, pilotage, déploiement IA) et les cas d'usage les plus pertinents pour le poste." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (userMessage) => {
    if (!userMessage || !userMessage.trim() || isLoading) return;

    const normalizedMessage = userMessage.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Construire l'historique de conversation
      const conversationHistory = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: normalizedMessage,
          conversationHistory: conversationHistory
        }),
      });

      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error("Réponse vide");
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Désolé, une erreur est survenue lors du traitement de la réponse. Veuillez réessayer."
          }
        ]);
        setIsLoading(false);
        return;
      }

      if (data.error) {
        if (data.retry) {
          // Réessayer après un délai si le modèle charge
          setTimeout(() => {
            sendMessage(normalizedMessage);
          }, 3000);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Le modèle est en cours de chargement. Nouvelle tentative dans 3 secondes..."
            }
          ]);
          return;
        }
        const errorDetails = data.details ? `\n\nDétails: ${typeof data.details === "string" ? data.details : JSON.stringify(data.details)}` : "";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Désolé, une erreur est survenue : ${data.error}${errorDetails}\n\nPouvez-vous réessayer ?`
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message
          }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur de connexion est survenue. Veuillez réessayer."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: "absolute",
                bottom: "80px",
                right: "0",
                background: "var(--bg-secondary)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--fg)",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                animation: "chatbotFadeIn 0.3s ease",
                fontFamily: "monospace"
              }}
            >
              💬 Pose-moi tes questions !
              <div
                style={{
                  position: "absolute",
                  bottom: "-8px",
                  right: "20px",
                  width: "0",
                  height: "0",
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid var(--line-blueprint)"
                }}
              />
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={(e) => {
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
              }
              tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
              e.currentTarget.style.transform = "scale(1.15)";
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
              }
              setShowTooltip(false);
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2), 0 0 0 0 rgba(59, 130, 246, 0.4)";
            }}
            className="chatbot-button"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--accent)",
              border: "none",
              color: "var(--bg)",
              fontSize: "28px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2), 0 0 0 0 rgba(59, 130, 246, 0.4)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              transform: "scale(1)",
              animation: "chatbotPulse 2s infinite"
            }}
            aria-label="Ouvrir le chatbot"
          >
            💬
          </button>
          
        </div>
      )}

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "400px",
            maxWidth: "calc(100vw - 48px)",
            height: "600px",
            maxHeight: "calc(100vh - 48px)",
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001,
            overflow: "hidden"
          }}
        >
          {/* En-tête */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "2px solid var(--line-blueprint)",
              background: "var(--bg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--fg)",
                  marginBottom: "4px"
                }}
              >
                Assistant IA
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "monospace"
                }}
              >
                Posez vos questions sur Eddy MISSONI
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--fg-muted)",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--line-blueprint)";
                e.target.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "var(--fg-muted)";
              }}
              aria-label="Fermer le chatbot"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background:
                      msg.role === "user"
                        ? "var(--accent)"
                        : "var(--bg)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid var(--line-blueprint)",
                    color:
                      msg.role === "user"
                        ? "var(--bg)"
                        : "var(--fg)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap" // Préserver les sauts de ligne naturels
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start"
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "var(--bg)",
                    border: "1px solid var(--line-blueprint)",
                    fontSize: "14px",
                    color: "var(--fg-muted)",
                    fontFamily: "monospace"
                  }}
                >
                  En train de réfléchir...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: "16px",
              borderTop: "2px solid var(--line-blueprint)",
              background: "var(--bg)"
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "10px"
              }}
            >
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    border: "1px solid var(--line-blueprint)",
                    background: "var(--bg-secondary)",
                    color: "var(--fg-muted)",
                    borderRadius: "999px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    cursor: isLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none"
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  padding: "12px 20px",
                  background: isLoading || !input.trim() ? "var(--line-blueprint)" : "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--bg)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

