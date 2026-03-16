"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const TABLE_PROPS = [
  {
    id: "book-cyber",
    name: "Les bonnes pratiques cyber",
    type: "book",
    label: "les bonnes pratiques cyber",
    position: [-1.2, 0.978, 0.22],
    info:
      "Rappels cyber:\n- MFA obligatoire\n- Gestion des correctifs\n- Politique de mots de passe\n- Sensibilisation phishing\n- Journalisation SOC",
  },
];

const DESKTOP_ITEMS = [
  {
    id: "dossier-cyber",
    name: "Dossier Cyber",
    kind: "folder",
    content: [
      "playbook_incident_response.docx",
      "checklist_mfa.pdf",
      "audit_vulnerabilites_q1.xlsx",
      "rapport_soc_hebdo.txt",
    ],
  },
  {
    id: "dossier-ia",
    name: "Dossier IA",
    kind: "folder",
    content: [
      "prompt_security_guidelines.md",
      "llm_eval_benchmark.csv",
      "policy_human_in_the_loop.pdf",
      "rag_architecture.png",
    ],
  },
  {
    id: "dossier-data",
    name: "Dossier Data",
    kind: "folder",
    content: [
      "data_quality_rules.yml",
      "rgpd_register_2026.xlsx",
      "lineage_pipeline_overview.drawio",
      "kpi_data_trust_dashboard.pbix",
    ],
  },
  {
    id: "dossier-it",
    name: "Dossier IT Ops",
    kind: "folder",
    content: [
      "runbook_prod_restart.md",
      "backup_restore_test_2026-03.pdf",
      "inventory_assets_cmdb.csv",
      "sla_slo_services.xlsx",
    ],
  },
  {
    id: "readme",
    name: "README.txt",
    kind: "file",
    text:
      "Poste analyste - bureau virtuel\n\nCe poste centralise les dossiers Cyber, IA, Data et IT.\nLes documents sont des simulations pour entrainement.",
  },
];

function DesktopWorkspace({ onClose, items, activeItem, onOpenItem, onClearItem }) {
  const iconPositions = [
    { top: "6%", left: "3%" },
    { top: "28%", left: "8%" },
    { top: "14%", left: "22%" },
    { top: "48%", left: "17%" },
    { top: "10%", left: "78%" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 225,
        background:
          "radial-gradient(circle at 20% 15%, rgba(56,189,248,0.2) 0%, transparent 35%), linear-gradient(135deg, #0b1020 0%, #16223d 45%, #0f172a 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "16px 16px 52px 16px",
          border: "1px solid rgba(148,163,184,0.28)",
          borderRadius: 10,
          background: "rgba(15,23,42,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          {items.map((entry, index) => (
            <button
              key={entry.id}
              onClick={() => onOpenItem(entry.id)}
              style={{
                position: "absolute",
                top: iconPositions[index % iconPositions.length].top,
                left: iconPositions[index % iconPositions.length].left,
                width: 108,
                border: "1px solid rgba(148,163,184,0.18)",
                background: activeItem?.id === entry.id ? "rgba(56,189,248,0.25)" : "rgba(15,23,42,0.35)",
                color: "#e2e8f0",
                borderRadius: 8,
                padding: "12px 8px",
                cursor: "pointer",
                textAlign: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <div style={{ fontSize: 27, marginBottom: 6 }}>{entry.kind === "folder" ? "📁" : "📄"}</div>
              <div style={{ fontSize: 12, lineHeight: 1.4 }}>{entry.name}</div>
            </button>
          ))}
        </div>

        {activeItem && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(640px, 92vw)",
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: 12,
              border: "1px solid rgba(125,211,252,0.45)",
              background: "linear-gradient(170deg, rgba(10,18,36,0.96) 0%, rgba(2,6,23,0.96) 100%)",
              boxShadow: "0 26px 70px rgba(2,132,199,0.28)",
              color: "#e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                borderBottom: "1px solid rgba(148,163,184,0.25)",
              }}
            >
              <strong style={{ fontSize: 14 }}>{activeItem.name}</strong>
              <button
                onClick={onClearItem}
                style={{
                  border: "1px solid rgba(148,163,184,0.45)",
                  background: "rgba(15,23,42,0.75)",
                  color: "#e2e8f0",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>

            <div style={{ padding: 14 }}>
              {activeItem.kind === "folder" && (
                <div style={{ display: "grid", gap: 8 }}>
                  {activeItem.content.map((fileName) => (
                    <div
                      key={fileName}
                      style={{
                        background: "rgba(15,23,42,0.55)",
                        border: "1px solid rgba(148,163,184,0.2)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {fileName}
                    </div>
                  ))}
                </div>
              )}

              {activeItem.kind === "file" && (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                    fontSize: 13,
                    background: "rgba(4,10,24,0.8)",
                    border: "1px solid rgba(125,211,252,0.2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  {activeItem.text}
                </pre>
              )}

              <div
                style={{
                  marginTop: 14,
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(125,211,252,0.22)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: "#bae6fd",
                }}
              >
                Si vous souhaitez aller plus loin sur ce sujet, vous pouvez me contacter via le formulaire du portfolio.
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 40,
          background: "rgba(2,6,23,0.9)",
          borderTop: "1px solid rgba(148,163,184,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          color: "#cbd5e1",
          fontSize: 12,
        }}
      >
        <div>🪟 Bureau virtuel</div>
        <button
          onClick={onClose}
          style={{
            border: "1px solid rgba(148,163,184,0.45)",
            background: "rgba(15,23,42,0.75)",
            color: "#e2e8f0",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Quitter le bureau
        </button>
      </div>
    </div>
  );
}

function InteractionHotspot({ position, rotation, onInteract }) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onInteract();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[0.94, 0.5]} />
        <meshStandardMaterial
          color={hovered ? "#60a5fa" : "#0b1220"}
          emissive={hovered ? "#60a5fa" : "#1d4ed8"}
          emissiveIntensity={hovered ? 0.45 : 0.14}
          transparent
          opacity={hovered ? 0.24 : 0.07}
        />
      </mesh>
      <Text
        position={[0, -0.32, 0.01]}
        fontSize={0.05}
        color={hovered ? "#dbeafe" : "#93c5fd"}
        anchorX="center"
        anchorY="middle"
      >
        Ouvrir Bureau
      </Text>
    </group>
  );
}

function HighTable() {
  const topH = 0.07;
  const topY = 0.94;
  const legH = topY - topH / 2;
  const legW = 0.09;

  return (
    <group>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, topH, 1.55]} />
        <meshStandardMaterial color="#2d1e0e" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, topY - topH / 2 - 0.015, 0.78]} receiveShadow>
        <boxGeometry args={[3.4, 0.03, 0.04]} />
        <meshStandardMaterial color="#3d2810" roughness={0.5} />
      </mesh>

      {[[-1.58, -0.7], [1.58, -0.7], [-1.58, 0.7], [1.58, 0.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]} castShadow>
          <boxGeometry args={[legW, legH, legW]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.75} />
        </mesh>
      ))}

      <mesh position={[0, 0.32, -0.7]} castShadow>
        <boxGeometry args={[3.2, 0.06, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.75} />
      </mesh>
    </group>
  );
}

function Computer() {
  return (
    <group>
      <mesh position={[0, 0.96, -0.42]} castShadow>
        <boxGeometry args={[0.38, 0.04, 0.32]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.22, -0.44]} castShadow>
        <boxGeometry args={[0.07, 0.5, 0.07]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.58, -0.48]} castShadow>
        <boxGeometry args={[1.18, 0.7, 0.08]} />
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.58, -0.405]} castShadow>
        <boxGeometry args={[1.12, 0.64, 0.04]} />
        <meshStandardMaterial color="#020617" roughness={0.22} metalness={0.72} />
      </mesh>
      <mesh position={[0, 1.58, -0.38]}>
        <boxGeometry args={[0.98, 0.54, 0.02]} />
        <meshStandardMaterial
          color="#143b7a"
          emissive="#1d4ed8"
          emissiveIntensity={0.9}
          roughness={0.08}
          metalness={0.12}
        />
      </mesh>
      {[-0.18, -0.02, 0.14].map((y, i) => (
        <mesh key={i} position={[-0.05, 1.58 + y, -0.367]}>
          <boxGeometry args={[0.7 - i * 0.12, 0.025, 0.001]} />
          <meshStandardMaterial color="#93c5fd" emissive="#93c5fd" emissiveIntensity={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.965, 0.22]} castShadow>
        <boxGeometry args={[0.82, 0.025, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.962, 0.25]} castShadow>
        <boxGeometry args={[0.12, 0.03, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.45} />
      </mesh>
    </group>
  );
}

function TableProp({ item, onOpen }) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  if (item.type === "mug") {
    return (
      <group
        position={item.position}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(item.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.065, 0.14, 18]} />
          <meshStandardMaterial color={hovered ? "#334155" : "#0f172a"} roughness={0.55} metalness={0.4} />
        </mesh>
        <mesh position={[0.08, 0.01, 0]}>
          <torusGeometry args={[0.035, 0.008, 10, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <Text position={[0, 0.01, 0.071]} fontSize={0.038} color="#f8fafc" anchorX="center" anchorY="middle">
          5284
        </Text>
      </group>
    );
  }

  if (item.type === "usb") {
    return (
      <group
        position={item.position}
        rotation={[Math.PI, 0.25, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(item.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.055, 0.08]} />
          <meshStandardMaterial color={hovered ? "#0ea5e9" : "#1e293b"} roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0.095, 0, 0]}>
          <boxGeometry args={[0.045, 0.04, 0.06]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    );
  }

  return (
    <group
      position={item.position}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(item.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.028, 0.3]} />
        <meshStandardMaterial color={hovered ? "#2563eb" : "#1e3a8a"} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.33, 0.005, 0.23]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.92} />
      </mesh>
      <Text position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.03} color="#0f172a" maxWidth={0.28} anchorX="center" anchorY="middle">
        {item.label}
      </Text>
    </group>
  );
}

function Scene({ onOpenDesktop, onOpenProp }) {
  const controlsRef = useRef(null);

  return (
    <>
      <color attach="background" args={["#131a2d"]} />
      <fog attach="fog" args={["#131a2d", 7, 22]} />

      <ambientLight intensity={1.35} />
      <hemisphereLight intensity={1.05} groundColor="#1f2a44" color="#ecfeff" />
      <directionalLight
        position={[3, 8, 3]}
        intensity={3.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[0, 4.8, 0]} color="#fff8e7" intensity={3.9} distance={18} />
      <pointLight position={[0, 1.58, -0.25]} color="#60a5fa" intensity={1.8} distance={6} />
      <pointLight position={[-4.2, 2.8, -1.4]} color="#dbeafe" intensity={2.1} />
      <pointLight position={[4.2, 2.8, -1.4]} color="#dbeafe" intensity={2.1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1a2235" roughness={0.82} metalness={0.12} />
      </mesh>
      <mesh position={[0, 3.5, -6.2]} receiveShadow>
        <boxGeometry args={[14, 7, 0.24]} />
        <meshStandardMaterial color="#131e35" />
      </mesh>
      <mesh position={[-7, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 7, 0.24]} />
        <meshStandardMaterial color="#10192e" />
      </mesh>
      <mesh position={[7, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 7, 0.24]} />
        <meshStandardMaterial color="#10192e" />
      </mesh>

      <HighTable />
      <Computer />

      <InteractionHotspot position={[0, 1.58, -0.355]} rotation={[0, 0, 0]} onInteract={onOpenDesktop} />

      {TABLE_PROPS.map((prop) => (
        <TableProp key={prop.id} item={prop} onOpen={onOpenProp} />
      ))}

      <OrbitControls
        ref={controlsRef}
        target={[0, 1.2, 0]}
        enablePan
        screenSpacePanning
        minDistance={0.45}
        maxDistance={18}
        minPolarAngle={0.06}
        maxPolarAngle={Math.PI - 0.08}
        enableRotate
        enableDamping
        dampingFactor={0.07}
      />
    </>
  );
}

const CYBER_INVESTIGATION = {
  emails: [
    {
      id: "email1",
      from: "cto@company.com",
      subject: "Urgence: Possible fuite détectée",
      date: "15 Mars 2026",
      body: "Bonjour,\n\nNous avons detecte une anomalie dans nos logs d'acces. Quelqu'un a telecharge 500MB de donnees sensibles hier soir entre 18h et 19h. Verifie les acces RDP et SSH.\n\nLe fichier leak_report.xlsx contient les details.\n\nCordialement,\nThomas",
    },
    {
      id: "email2",
      from: "alex.dev@company.com",
      subject: "Re: Urgent password reset",
      date: "14 Mars 2026",
      body: "J'ai recu ton mail. J'ai change mon mot de passe en P@ssw0rd_Dev2026! mais je dois aussi mettre a jour la base de donnees.\n\nSalut\nAlex",
    },
    {
      id: "email3",
      from: "marie.rh@company.com",
      subject: "Nouvel employé - Pierre Dubois",
      date: "10 Mars 2026",
      body: "Le nouvel employé Pierre Dubois arrive demain. Login: pdubois. Mot de passe temporaire: TempPass123!2026\n\nIl doit avoir accès aux répertoires /data et /backups.\n\nCordialement,\nMarie",
    },
  ],
  documents: [
    {
      id: "doc1",
      name: "leak_report.xlsx",
      content:
        "RAPPORT DE FUITE - 15 MARS 2026\n\nDonnees compromises:\n- 5000+ donnees clients (noms, emails, telephones)\n- 200+ informations de paiement\n- Donnees medicales (RGPD)\n\nAcces detectes:\n- Utilisateur: pdubois\n- IP Source: 192.168.1.105\n- Heure: 18:15 - 18:45 (30 minutes)\n- Fichiers accedes: client_database.sql, payments.xlsx, health_records.csv\n\nStatut: INCIDENT CRITIQUE",
    },
    {
      id: "doc2",
      name: "access_logs_march.csv",
      content:
        "Timestamp,User,IP,Action,Status\n2026-03-14 14:30,alex.dev,192.168.1.101,LOGIN_SSH,SUCCESS\n2026-03-15 17:45,pdubois,192.168.1.105,LOGIN_RDP,SUCCESS\n2026-03-15 18:00,pdubois,192.168.1.105,FILE_DOWNLOAD,client_database.sql\n2026-03-15 18:15,pdubois,192.168.1.105,FILE_DOWNLOAD,payments.xlsx\n2026-03-15 18:30,pdubois,192.168.1.105,FILE_DOWNLOAD,health_records.csv\n2026-03-15 18:45,pdubois,192.168.1.105,LOGOUT_RDP,SUCCESS",
    },
    {
      id: "doc3",
      name: "employee_credentials.txt",
      content:
        "!!! CONFIDENTIAL !!!\n\nEmergency Credentials Backup:\n\nalex.dev:\nLogin: alex.dev@company.com\nPassword: P@ssw0rd_Dev2026!\nAccess Level: ADMIN\n\npdubois:\nLogin: pdubois\nPassword: TempPass123!2026\nAccess Level: USER (recently promoted)\n\n** IMPORTANT: Change passwords immediately after use **",
    },
  ],
  postits: [
    {
      id: "postit1",
      text: "Pierre appelle demain - VPN: vpn.company.local Port: 443",
    },
    {
      id: "postit2",
      text: "Alex mot de passe: P@ssw0rd_Dev2026! (important, a partager)",
    },
    {
      id: "postit3",
      text: "Incident CRITIQUE - Chercher qui a telecharge les donnees!",
    },
  ],
};

function CyberSecurityChallenge({ onClose }) {
  const [screen, setScreen] = useState("welcome"); // welcome, investigation, analysis, complete
  const [activeTab, setActiveTab] = useState("emails");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [foundPasswords, setFoundPasswords] = useState([]);
  const [passwordInput, setPasswordInput] = useState("");
  const [investigationComplete, setInvestigationComplete] = useState(false);
  const [qcmAnswers, setQcmAnswers] = useState({});

  const revealedDocs = selectedEmail?.id === "email1" ? ["leak_report.xlsx"] : [];

  const allPasswords = ["P@ssw0rd_Dev2026!", "TempPass123!2026"];

  const handleAddPassword = () => {
    if (passwordInput.trim() && !foundPasswords.includes(passwordInput.trim())) {
      setFoundPasswords([...foundPasswords, passwordInput.trim()]);
      setPasswordInput("");
    }
  };

  const handleQcmAnswer = (qestionId, correct) => {
    setQcmAnswers({ ...qcmAnswers, [qestionId]: correct });
  };

  const allQcmCompleted = Object.keys(qcmAnswers).length === 3;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        zIndex: 260,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {screen === "welcome" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontSize: 48, color: "#38bdf8", margin: "0 0 20px 0", fontWeight: 700 }}>
              🛡️ Espace Cyber - Mise en Situation
            </h1>
            <p style={{ fontSize: 18, color: "#bae6fd", margin: "0 0 16px 0", lineHeight: 1.8 }}>
              Bienvenue sur cet espace de développement mis en place par <strong>Eddy MISSONI</strong> pour vous permettre d'être mis en situation sur un sujet de cybersécurité.
            </p>

            <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: 20, margin: "24px 0" }}>
              <p style={{ fontSize: 16, color: "#fca5a5", margin: 0, lineHeight: 1.7 }}>
                <strong>⚠️ ALERTE INCIDENT:</strong> Une fuite de données sensibles a été détectée sur notre infrastructure hier soir. 5000+ données clients compromises. Vous devez investiguer les logs, emails, documents et informations disponibles pour identifier la source de la fuite.
              </p>
            </div>

            <p style={{ fontSize: 14, color: "#94a3b8", margin: "20px 0", lineHeight: 1.6 }}>
              Vous devrez:
            </p>
            <ul style={{ fontSize: 14, color: "#cbd5e1", textAlign: "left", display: "inline-block" }}>
              <li>📧 Lire les emails pour trouver des indices</li>
              <li>📄 Consulter les documents et fichiers compromis</li>
              <li>📝 Chercher les mots de passe sur les post-its</li>
              <li>🔍 Identifier l'employé responsable</li>
              <li>✅ Répondre aux questions de sécurité</li>
            </ul>

            <button
              onClick={() => setScreen("investigation")}
              style={{
                marginTop: 32,
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid rgba(56,189,248,0.9)",
                background: "rgba(14,165,233,0.2)",
                color: "#e2e8f0",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Commencer l'Investigation →
            </button>
          </div>
        </div>
      )}

      {screen === "investigation" && (
        <>
          <div style={{ background: "rgba(2,6,23,0.8)", borderBottom: "1px solid rgba(56,189,248,0.3)", padding: "16px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: "#38bdf8" }}>Bureau d'Investigation</h2>
              <button
                onClick={() => onClose()}
                style={{
                  border: "1px solid rgba(148,163,184,0.45)",
                  background: "rgba(15,23,42,0.75)",
                  color: "#e2e8f0",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Quitter
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {[
                { id: "emails", label: "📧 Emails" },
                { id: "documents", label: "📄 Documents" },
                { id: "postits", label: "📝 Post-its" },
                { id: "passwords", label: "🔑 Mots de passe trouves" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    border: activeTab === tab.id ? "1px solid rgba(56,189,248,0.9)" : "1px solid rgba(148,163,184,0.3)",
                    background: activeTab === tab.id ? "rgba(14,165,233,0.15)" : "transparent",
                    color: "#e2e8f0",
                    borderRadius: 6,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ width: "35%", borderRight: "1px solid rgba(56,189,248,0.2)", overflowY: "auto", background: "rgba(15,23,42,0.6)" }}>
              {activeTab === "emails" && (
                <div>
                  {CYBER_INVESTIGATION.emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      style={{
                        width: "100%",
                        padding: 14,
                        borderBottom: "1px solid rgba(56,189,248,0.1)",
                        border: selectedEmail?.id === email.id ? "1px solid rgba(56,189,248,0.5)" : "none",
                        background: selectedEmail?.id === email.id ? "rgba(14,165,233,0.12)" : "transparent",
                        color: "#e2e8f0",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{email.from}</div>
                      <div style={{ fontSize: 12, color: "#bae6fd", marginBottom: 4 }}>{email.subject}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{email.date}</div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === "documents" && (
                <div>
                  {CYBER_INVESTIGATION.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      style={{
                        width: "100%",
                        padding: 14,
                        borderBottom: "1px solid rgba(56,189,248,0.1)",
                        border: selectedDoc?.id === doc.id ? "1px solid rgba(56,189,248,0.5)" : "none",
                        background: selectedDoc?.id === doc.id ? "rgba(14,165,233,0.12)" : "transparent",
                        color: "#e2e8f0",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>📄 {doc.name}</div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === "postits" && (
                <div style={{ padding: 16 }}>
                  {CYBER_INVESTIGATION.postits.map((postit) => (
                    <div
                      key={postit.id}
                      style={{
                        background: "rgba(255,193,7,0.12)",
                        border: "1px solid rgba(255,193,7,0.3)",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                        fontSize: 13,
                        color: "#fcd34d",
                        lineHeight: 1.5,
                      }}
                    >
                      {postit.text}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "passwords" && (
                <div style={{ padding: 16 }}>
                  <div style={{ marginBottom: 14 }}>
                    <input
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddPassword()}
                      placeholder="Entrez un mot de passe trouve..."
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid rgba(56,189,248,0.3)",
                        borderRadius: 6,
                        color: "#e2e8f0",
                        fontSize: 12,
                        marginBottom: 8,
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleAddPassword}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.4)",
                        color: "#4ade80",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Ajouter mot de passe
                    </button>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Mots de passe trouves:</p>
                    {foundPasswords.map((pwd, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: 6,
                          padding: 8,
                          marginBottom: 6,
                          fontSize: 11,
                          color: "#4ade80",
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {pwd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "rgba(10,18,36,0.8)" }}>
              {activeTab === "emails" && selectedEmail && (
                <div>
                  <h3 style={{ color: "#38bdf8", marginTop: 0 }}>{selectedEmail.subject}</h3>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    De: {selectedEmail.from} | {selectedEmail.date}
                  </p>
                  <pre
                    style={{
                      background: "rgba(4,10,24,0.8)",
                      border: "1px solid rgba(125,211,252,0.2)",
                      borderRadius: 8,
                      padding: 14,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "#cbd5e1",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {selectedEmail.body}
                  </pre>
                </div>
              )}
              {activeTab === "documents" && selectedDoc && (
                <div>
                  <h3 style={{ color: "#38bdf8", marginTop: 0 }}>📄 {selectedDoc.name}</h3>
                  <pre
                    style={{
                      background: "rgba(4,10,24,0.8)",
                      border: "1px solid rgba(125,211,252,0.2)",
                      borderRadius: 8,
                      padding: 14,
                      fontSize: 11,
                      lineHeight: 1.5,
                      color: "#cbd5e1",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {selectedDoc.content}
                  </pre>
                </div>
              )}
              {!selectedEmail && activeTab === "emails" && (
                <p style={{ color: "#64748b", textAlign: "center", marginTop: 60 }}>Selectionnez un email pour afficher son contenu</p>
              )}
              {!selectedDoc && activeTab === "documents" && (
                <p style={{ color: "#64748b", textAlign: "center", marginTop: 60 }}>Selectionnez un document pour l'afficher</p>
              )}
            </div>
          </div>

          <div style={{ background: "rgba(2,6,23,0.9)", borderTop: "1px solid rgba(56,189,248,0.3)", padding: "16px 24px" }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                Progression: {foundPasswords.length}/{allPasswords.length} mots de passe • Mots de passe corrects: {foundPasswords.filter((p) => allPasswords.includes(p)).length}
              </p>
            </div>
            <button
              onClick={() => setScreen("analysis")}
              disabled={foundPasswords.filter((p) => allPasswords.includes(p)).length < 2}
              style={{
                padding: "10px 20px",
                background: foundPasswords.filter((p) => allPasswords.includes(p)).length === 2 ? "rgba(14,165,233,0.2)" : "rgba(56,65,85,0.5)",
                border: foundPasswords.filter((p) => allPasswords.includes(p)).length === 2 ? "1px solid rgba(56,189,248,0.9)" : "1px solid rgba(148,163,184,0.3)",
                color: "#e2e8f0",
                borderRadius: 8,
                cursor: foundPasswords.filter((p) => allPasswords.includes(p)).length === 2 ? "pointer" : "not-allowed",
                fontSize: 14,
              }}
            >
              Passer a l'analyse →
            </button>
          </div>
        </>
      )}

      {screen === "analysis" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <h2 style={{ color: "#38bdf8", marginTop: 0, fontSize: 24 }}>Analyse de l'Incident</h2>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
            Basé sur votre enquete, repondez aux questions suivantes pour determiner la cause de la fuite:
          </p>

          <div style={{ marginTop: 24 }}>
            {[
              {
                id: "q1",
                question: "Quel employé a causé la fuite de données?",
                options: [
                  { text: "Alex (alex.dev@company.com) - Admin", correct: false },
                  { text: "Pierre Dubois (pdubois) - Nouvel employé", correct: true },
                  { text: "Marie de RH", correct: false },
                  { text: "Thomas le CTO", correct: false },
                ],
              },
              {
                id: "q2",
                question: "A quelle heure la fuite s'est-elle produite?",
                options: [
                  { text: "14:30", correct: false },
                  { text: "17:45", correct: false },
                  { text: "18:15 - 18:45", correct: true },
                  { text: "19:00 - 20:00", correct: false },
                ],
              },
              {
                id: "q3",
                question: "Quel est le vecteur d'acces utilise pour la fuite?",
                options: [
                  { text: "Clé USB infectée", correct: false },
                  { text: "Email de phishing", correct: false },
                  { text: "RDP avec mot de passe temporaire non change", correct: true },
                  { text: "Vulnerability 0-day", correct: false },
                ],
              },
            ].map((q) => (
              <div key={q.id} style={{ marginBottom: 24, padding: 16, background: "rgba(15,23,42,0.7)", borderRadius: 10, border: "1px solid rgba(56,189,248,0.2)" }}>
                <p style={{ margin: "0 0 12px 0", color: "#e2e8f0", fontWeight: 600 }}>{q.question}</p>
                <div style={{ display: "grid", gap: 8 }}>
                  {q.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQcmAnswer(q.id, opt.correct)}
                      style={{
                        textAlign: "left",
                        padding: 12,
                        background: qcmAnswers[q.id] === opt.correct ? "rgba(34,197,94,0.15)" : "rgba(51,65,85,0.5)",
                        border: qcmAnswers[q.id] === opt.correct ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(56,189,248,0.2)",
                        color: "#e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {qcmAnswers[q.id] === opt.correct ? "✅ " : "○ "}
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              onClick={() => setScreen("investigation")}
              style={{
                padding: "12px 20px",
                background: "rgba(56,65,85,0.5)",
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#e2e8f0",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              ← Retour enquete
            </button>
            <button
              onClick={() => setScreen("complete")}
              disabled={!allQcmCompleted}
              style={{
                padding: "12px 20px",
                background: allQcmCompleted ? "rgba(14,165,233,0.2)" : "rgba(56,65,85,0.5)",
                border: allQcmCompleted ? "1px solid rgba(56,189,248,0.9)" : "1px solid rgba(148,163,184,0.3)",
                color: "#e2e8f0",
                borderRadius: 8,
                cursor: allQcmCompleted ? "pointer" : "not-allowed",
                opacity: allQcmCompleted ? 1 : 0.5,
              }}
            >
              Voir resultat →
            </button>
          </div>
        </div>
      )}

      {screen === "complete" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontSize: 44, color: "#4ade80", margin: "0 0 20px 0" }}>✅ Incident Resolu!</h1>
            <p style={{ fontSize: 18, color: "#bae6fd", margin: "0 0 20px 0", lineHeight: 1.8 }}>
              Excellente analyse! Vous avez correctement identifié Pierre Dubois comme responsable de la fuite. Un mot de passe temporaire non changé a permis à un nouvel employé d'accéder à des données sensibles.
            </p>

            <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 12, padding: 20, margin: "24px 0", textAlign: "left" }}>
              <p style={{ color: "#4ade80", margin: "0 0 12px 0", fontWeight: 600 }}>🔍 Recommandations de Sécurité:</p>
              <ul style={{ color: "#cbd5e1", margin: 0, paddingLeft: 20 }}>
                <li>Toujours changer les mots de passe temporaires au premier acces</li>
                <li>Limiter l'accès des nouveaux employés (principe du moindre privilège)</li>
                <li>Monitorer les telechargements massifs (data exfiltration)</li>
                <li>Utiliser MFA pour tous les acces critiques</li>
              </ul>
            </div>

            <button
              onClick={() => onClose()}
              style={{
                marginTop: 24,
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid rgba(56,189,248,0.9)",
                background: "rgba(14,165,233,0.2)",
                color: "#e2e8f0",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Fermer et revenir a la table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CYBER_SCENARIOS = [
  {
    id: "phishing",
    title: "🎣 Détection de Phishing",
    description: "Vous recevez un email suspect.",
    email: "Sender: noreply@secure-paypa1.com\nSubject: Confirmez votre compte PayPal\nMessage: Cliquez ici pour vérifier votre identité",
    question: "Quels indices indiquent que cet email est un phishing?",
    options: [
      { text: "Adresse email avec '0' au lieu de 'a' dans 'paypal'", correct: true },
      { text: "Le message demande une vérification d'identité", correct: true },
      { text: "L'email contient un lien de clic", correct: false },
      { text: "C'est un email de PayPal officiel", correct: false },
    ],
    explanation: "Les attaquants usurpent les domaines en remplaçant des lettres similaires. PayPal ne demande jamais de vérification par email non sécurisé.",
  },
  {
    id: "password",
    title: "🔐 Politique de Mot de Passe",
    description: "Créez un mot de passe pour l'accès critique.",
    question: "Quel mot de passe est le plus sécurisé?",
    options: [
      { text: "Admin123", correct: false },
      { text: "P@ssw0rd2026!", correct: true },
      { text: "Entreprise", correct: false },
      { text: "12345678", correct: false },
    ],
    explanation: "Un bon mot de passe contient: majuscules, minuscules, chiffres, caractères spéciaux et >12 caractères. Évitez noms communs ou motifs séquentiels.",
  },
  {
    id: "mfa",
    title: "🔑 Authentification Multi-Facteur (MFA)",
    description: "Un utilisateur accède à son compte avec MFA activée.",
    question: "Pourquoi MFA est-elle essentielle?",
    options: [
      { text: "Cela ralentit les attaques par brute force", correct: true },
      { text: "Limite l'accès même si le mot de passe est compromis", correct: true },
      { text: "Cela élimine tous les risques de sécurité", correct: false },
      { text: "C'est obligatoire légalement", correct: false },
    ],
    explanation: "MFA ajoute une couche de sécurité. Même si un attaquant obtient votre mot de passe, il ne peut pas accéder sans le deuxième facteur (téléphone, clé de sécurité, etc).",
  },
  {
    id: "patch",
    title: "🔧 Gestion des Correctifs",
    description: "Une vulnérabilité critique est découverte dans votre logiciel.",
    question: "Quelle est la meilleure action?",
    options: [
      { text: "Attendre une mise à jour mineure plus tard", correct: false },
      { text: "Appliquer immédiatement le correctif en production", correct: true },
      { text: "Ignorer car votre système n'est pas touché", correct: false },
      { text: "Mettre à jour seulement après tests complets (délai toléré)", correct: true },
    ],
    explanation: "Les vulnérabilités critiques doivent être corrigées rapidement. Testez en environnement de staging d'abord, puis déployez dès que possible.",
  },
];

function PropPreviewScene({ item, viewMode }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    const viewPositions = {
      front: [0, 0.12, 1.5],
      side: [1.5, 0.1, 0],
      top: [0, 1.8, 0.001],
      perspective: [1.1, 0.8, 1.2],
    };

    const [x, y, z] = viewPositions[viewMode] || viewPositions.perspective;
    camera.position.set(x, y, z);
    camera.lookAt(0, 0.05, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.05, 0);
      controlsRef.current.update();
    }
  }, [viewMode, camera]);

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={2.2} />
      <directionalLight position={[2, 3, 2]} intensity={2.8} />
      <directionalLight position={[-2.5, 4, -1.5]} intensity={2.1} color="#e0f2fe" />
      <pointLight position={[-2, 1.8, -1]} intensity={2.2} color="#93c5fd" />
      <pointLight position={[2.2, 2.1, 1.3]} intensity={1.8} color="#bae6fd" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <circleGeometry args={[1.2, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.05} />
      </mesh>

      {item?.type === "mug" && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.34, 0.3, 0.64, 36]} />
            <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.42} />
          </mesh>
          <mesh position={[0, 0.31, 0]} castShadow>
            <torusGeometry args={[0.305, 0.022, 16, 42]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.3} />
          </mesh>
          <mesh position={[0.37, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.18, 0.038, 14, 30, Math.PI]} />
            <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.35} />
          </mesh>
          <Text position={[0, 0.02, 0.33]} fontSize={0.18} color="#f8fafc" anchorX="center" anchorY="middle">
            5284
          </Text>
        </group>
      )}

      {item?.type === "book" && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[1.06, 0.09, 0.78]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.48} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.048, 0]} castShadow>
            <boxGeometry args={[0.95, 0.02, 0.67]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.92} />
          </mesh>
          <Text position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.085} color="#0f172a" maxWidth={0.84} anchorX="center" anchorY="middle">
            {item.label}
          </Text>
        </group>
      )}

      {item?.type === "usb" && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.22, 0.42]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.72} />
          </mesh>
          <mesh position={[0.47, 0, 0]} castShadow>
            <boxGeometry args={[0.22, 0.16, 0.3]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.92} />
          </mesh>
          <Text position={[-0.08, 0.15, 0.0]} fontSize={0.08} color="#bae6fd" anchorX="center" anchorY="middle">
            USB
          </Text>
        </group>
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={0.8}
        maxDistance={3.2}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

const BOARD_ITEMS = [
  // ── Post-its ──────────────────────────────────────────────────────────
  { id: "p1", kind: "postit", color: "#fde68a", rotate: "-3deg", left: "3%",  top: "7%",  pin: "#dc2626", title: "ALERTE IP", text: "IP SUSPECTE:\n192.168.1.105\n→ À BLOQUER\nimmédiatement!" },
  { id: "p2", kind: "postit", color: "#fca5a5", rotate: "2.5deg", left: "72%", top: "4%",  pin: "#7c3aed", title: "IDENTIFIANT", text: "pdubois\nTempPass123!2026\n⚠️ Jamais changé\ndepuis création" },
  { id: "p3", kind: "postit", color: "#bbf7d0", rotate: "-1.5deg", left: "51%", top: "62%", pin: "#16a34a", title: "CNIL", text: "Notifier CNIL\navant 17/03 18h!\nArt. 33 RGPD\nOBLIGATOIRE" },
  { id: "p4", kind: "postit", color: "#c7d2fe", rotate: "3deg",   left: "17%", top: "63%", pin: "#1d4ed8", title: "FAILLE", text: "MFA NON ACTIVÉ\nsur nouveaux\ncomptes → faille\ncritique onboard." },
  { id: "p5", kind: "postit", color: "#fed7aa", rotate: "-2deg",  left: "85%", top: "56%", pin: "#ea580c", title: "BACKUP", text: "S3 bucket\ncompromis?\nVérif urgente\ncôté Cloud" },
  { id: "p6", kind: "postit", color: "#f0abfc", rotate: "1.5deg", left: "29%", top: "4%",  pin: "#a21caf", title: "NOUVEAUTÉ", text: "Pierre D.\narrivé 10/03\nAccès /data +\n/backups dès J+1" },

  // ── Polaroids / Photos ────────────────────────────────────────────────
  { id: "ph1", kind: "photo", rotate: "-2deg",   left: "38%", top: "3%",  width: 178, caption: "SUSPECT PRINCIPAL", sub: "PIERRE DUBOIS  —  pdubois", emoji: "👤", accent: "#7f1d1d" },
  { id: "ph2", kind: "photo", rotate: "1.5deg",  left: "4%",  top: "38%", width: 172, caption: "SERVEUR COMPROMIS", sub: "SRV-PROD-01  /  192.168.1.10",  emoji: "🖥️", accent: "#1e3a8a" },
  { id: "ph3", kind: "photo", rotate: "-1deg",   left: "66%", top: "35%", width: 170, caption: "DONNÉES EXFILTRÉES", sub: "~500 MB  •  15 Mars 18:00→18:45", emoji: "💾", accent: "#14532d" },
  { id: "ph4", kind: "photo", rotate: "2deg",    left: "82%", top: "3%",  width: 155, caption: "SESSION RDP", sub: "Durée: 30 min  •  Horaire anormal", emoji: "🔌", accent: "#78350f" },

  // ── Documents imprimés ────────────────────────────────────────────────
  { id: "d1", kind: "doc", rotate: "0.5deg",  left: "20%", top: "7%",  width: 192, title: "📋 LOGS D'ACCÈS — 15 MARS",      lines: ["17:45  LOGIN RDP  pdubois  ✓", "18:00  DOWNLOAD  client_db.sql", "18:15  DOWNLOAD  payments.xlsx", "18:30  DOWNLOAD  health_records", "18:45  LOGOUT RDP  pdubois"] },
  { id: "d2", kind: "doc", rotate: "-0.5deg", left: "54%", top: "19%", width: 200, title: "📧 EMAIL  CTO → RSSI",             lines: ["De: cto@company.com", "Objet: FUITE DÉTECTÉE", "«500MB de données sensibles", " téléchargées hier 18h–19h.", " Vérifier accès RDP et SSH»"] },
  { id: "d3", kind: "doc", rotate: "1deg",    left: "3%",  top: "68%", width: 185, title: "⚖️ NOTE RGPD",                     lines: ["Catégorie Art.9  → données santé", "Notification CNIL  < 72h", "Notification victimes obligatoire", "Délai max: 18 mars 2026 18h00"] },
  { id: "d4", kind: "doc", rotate: "-1.5deg", left: "73%", top: "68%", width: 190, title: "📐 PLAN DE RÉPONSE IR",            lines: ["1. Isoler poste pdubois", "2. Révoquer tous ses accès", "3. Analyser logs complets", "4. Notifier DPO + CNIL", "5. Rapport post-incident < 48h"] },
  { id: "d5", kind: "doc", rotate: "0deg",    left: "33%", top: "69%", width: 188, title: "👥 EMAIL RH — ONBOARDING",         lines: ["Login: pdubois", "MDP temp: TempPass123!2026", "Accès: /data  /backups", "⚠️ Accès provisoires JAMAIS", "  révoqués ni restreints"] },

  // ── Coupure de presse ─────────────────────────────────────────────────
  { id: "news", kind: "news", rotate: "-0.5deg", left: "22%", top: "39%", width: 210,
    headline: "NOUVEAUX EMPLOYÉS: ACCÈS TROP LARGES",
    sub: "L'entreprise aurait négligé le principe du moindre privilège — un employé dispose dès J+1 des accès à la base de données clients et aux backups." },

  // ── Sachet à conviction ────────────────────────────────────────────────
  { id: "bag", kind: "bag", rotate: "2deg", left: "83%", top: "22%", width: 148,
    label: "PIÈCE #3", content: "CLÉ USB INCONNUE\nTrouvée sous bureau\nEmpreintes relevées\nAnalyse lab en cours" },

  // ── Carte suspect ──────────────────────────────────────────────────────
  { id: "suspect", kind: "suspect", rotate: "0deg", left: "38%", top: "53%", width: 210 },

  // ── Timeline ───────────────────────────────────────────────────────────
  { id: "tl", kind: "timeline", rotate: "0.5deg", left: "13%", top: "4%", width: 185 },
];

// connexions fils rouges [x1%, y1%, x2%, y2%] sur le board (valeurs relatives au board)
const RED_STRINGS = [
  // suspect → IP
  { x1: "47%", y1: "26%", x2: "7%",  y2: "15%", color: "#ef4444" },
  // suspect → logs
  { x1: "44%", y1: "56%", x2: "26%", y2: "20%", color: "#ef4444" },
  // suspect → email RH
  { x1: "48%", y1: "56%", x2: "37%", y2: "72%", color: "#f97316" },
  // IP → photo serveur
  { x1: "7%",  y1: "23%", x2: "10%", y2: "42%", color: "#ef4444" },
  // logs → news
  { x1: "28%", y1: "25%", x2: "29%", y2: "44%", color: "#f59e0b", dash: "5 4" },
  // email data → photo data
  { x1: "62%", y1: "32%", x2: "73%", y2: "42%", color: "#ef4444" },
  // suspect → USB bag
  { x1: "52%", y1: "22%", x2: "87%", y2: "28%", color: "#a21caf", dash: "4 3" },
];

function EvidenceBoard({ onClose }) {
  const [popup, setPopup] = useState(null); // null | "contact"

  const handleItemClick = (e) => {
    e.stopPropagation();
    setPopup("contact");
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 230,
      background: "linear-gradient(180deg, #0a0705 0%, #120d09 35%, #1a1208 100%)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Ambiance plafond / lumière ── */}
      <div style={{
        position: "absolute", top: 0, left: "30%", right: "30%", height: 220,
        background: "radial-gradient(ellipse at 50% 0%, rgba(255,220,140,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* ── Murs latéraux ── */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: "5%", height: "100%",
        background: "linear-gradient(90deg, #0e0905 0%, #1a1108 100%)",
        borderRight: "1px solid rgba(255,200,100,0.05)",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, width: "5%", height: "100%",
        background: "linear-gradient(270deg, #0e0905 0%, #1a1108 100%)",
        borderLeft: "1px solid rgba(255,200,100,0.05)",
      }} />

      {/* ── Sol ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "10%",
        background: "linear-gradient(180deg, #1a1208 0%, #0e0a06 100%)",
        borderTop: "2px solid rgba(150,100,50,0.15)",
      }} />

      {/* ── GRAND TABLEAU ── */}
      <div style={{
        position: "absolute",
        left: "5.5%", right: "5.5%", top: "4%", bottom: "10%",
        borderRadius: 4,
        /* cadre bois */
        boxShadow: "0 0 0 14px #3d2409, 0 0 0 17px #2a1905, 0 30px 80px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.25)",
        border: "14px solid #3d2409",
        background: "#c8a97e",
        /* texture liège */
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(100,65,25,0.06) 0px, rgba(100,65,25,0.06) 1px, transparent 1px, transparent 7px)," +
          "repeating-linear-gradient(-45deg, rgba(130,85,30,0.04) 0px, rgba(130,85,30,0.04) 1px, transparent 1px, transparent 9px)," +
          "radial-gradient(ellipse at 50% 0%, rgba(255,230,160,0.18) 0%, transparent 60%)," +
          "linear-gradient(160deg, #c4a472 0%, #c8a878 40%, #be9f6e 100%)",
        overflow: "hidden",
      }}>
        {/* ── Fils rouges (SVG) ── */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {RED_STRINGS.map((s, i) => (
            <line
              key={i}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke={s.color}
              strokeWidth="1.6"
              strokeDasharray={s.dash || "none"}
              opacity="0.65"
            />
          ))}
        </svg>

        {/* ── Preuves ── */}
        {BOARD_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={handleItemClick}
            style={{
              position: "absolute",
              left: item.left,
              top: item.top,
              width: item.width || 155,
              transform: `rotate(${item.rotate})`,
              cursor: "pointer",
              zIndex: 2,
              transition: "transform 0.14s, filter 0.14s",
              filter: "drop-shadow(1px 3px 7px rgba(0,0,0,0.5))",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) scale(1.08)"; e.currentTarget.style.zIndex = 30; e.currentTarget.style.filter = "drop-shadow(2px 6px 14px rgba(0,0,0,0.65))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${item.rotate})`; e.currentTarget.style.zIndex = 2; e.currentTarget.style.filter = "drop-shadow(1px 3px 7px rgba(0,0,0,0.5))"; }}
          >
            {/* Punaise */}
            {(item.pin || item.kind === "photo" || item.kind === "doc" || item.kind === "news" || item.kind === "bag" || item.kind === "suspect" || item.kind === "timeline") && (
              <div style={{
                position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                width: 13, height: 13, borderRadius: "50%",
                background: item.pin
                  ? `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${item.pin} 80%, white), ${item.pin})`
                  : "radial-gradient(circle at 35% 35%, #f87171, #b91c1c)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.55)",
                zIndex: 5,
              }} />
            )}

            {/* POST-IT */}
            {item.kind === "postit" && (
              <div style={{
                background: `linear-gradient(160deg, ${item.color} 0%, ${item.color}cc 100%)`,
                padding: "13px 11px 11px",
                fontFamily: "'Segoe UI', cursive",
                fontSize: 12,
                color: "#1c1306",
                lineHeight: 1.55,
                whiteSpace: "pre-line",
                boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.4) inset",
                minHeight: 85,
                borderBottom: "2px solid rgba(0,0,0,0.07)",
              }}>
                <div style={{ fontWeight: 800, fontSize: 9, mb: 5, textTransform: "uppercase", opacity: 0.5, letterSpacing: 1, marginBottom: 5 }}>{item.title}</div>
                {item.text}
              </div>
            )}

            {/* PHOTO / POLAROID */}
            {item.kind === "photo" && (
              <div style={{
                background: "#f5efe3",
                border: "1px solid #d6c9aa",
                padding: "7px 7px 22px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${item.accent}33 0%, ${item.accent}55 100%)`,
                  height: 90,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 4, fontSize: 28,
                  border: `1px solid ${item.accent}44`,
                }}>
                  {item.emoji}
                  <div style={{ fontSize: 9, color: item.accent, fontWeight: 700, fontFamily: "monospace", letterSpacing: 0.5 }}>PHOTO #{item.id.slice(-2)}</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 9.5, color: "#3a2d18", fontFamily: "monospace", textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 800, fontSize: 9, color: item.accent, letterSpacing: 0.5 }}>{item.caption}</div>
                  {item.sub}
                </div>
              </div>
            )}

            {/* DOCUMENT IMPRIMÉ */}
            {item.kind === "doc" && (
              <div style={{
                background: "#faf6ee",
                border: "1px solid #d4c98e",
                borderLeft: "4px solid #ca8a04",
                padding: "9px 11px",
                fontFamily: "monospace",
                fontSize: 10.5,
                color: "#292524",
                lineHeight: 1.65,
                boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
              }}>
                <div style={{ fontWeight: 800, fontSize: 10, marginBottom: 6, color: "#92400e", borderBottom: "1px dashed #d4c98e", paddingBottom: 5 }}>{item.title}</div>
                {item.lines.map((l, i) => (
                  <div key={i} style={{ color: l.startsWith("⚠") ? "#b91c1c" : l.includes("✓") ? "#166534" : "#292524" }}>{l}</div>
                ))}
              </div>
            )}

            {/* COUPURE PRESSE */}
            {item.kind === "news" && (
              <div style={{
                background: "#f8f4e8",
                border: "1px solid #c4b07a",
                padding: "10px 12px",
                fontFamily: "Georgia, serif",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}>
                <div style={{ fontSize: 8, color: "#78716c", fontFamily: "monospace", marginBottom: 5, borderBottom: "1px solid #c4b07a", paddingBottom: 4 }}>
                  THE SECURITY REVIEW — 16 MARS 2026
                </div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#1c1716", lineHeight: 1.3, marginBottom: 7 }}>{item.headline}</div>
                <div style={{ fontSize: 10, color: "#44403c", lineHeight: 1.5, fontStyle: "italic" }}>{item.sub}</div>
              </div>
            )}

            {/* SACHET À CONVICTION */}
            {item.kind === "bag" && (
              <div style={{
                background: "rgba(219,234,254,0.4)",
                border: "2px dashed #3b82f6",
                borderRadius: 4,
                padding: "8px 10px",
                backdropFilter: "blur(2px)",
              }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#1e40af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, borderBottom: "1px solid #93c5fd", paddingBottom: 4 }}>
                  🔒 {item.label}
                </div>
                <div style={{ fontSize: 10.5, color: "#1e3a8a", fontFamily: "monospace", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.content}</div>
              </div>
            )}

            {/* CARTE SUSPECT */}
            {item.kind === "suspect" && (
              <div style={{
                background: "#fef2f2",
                border: "3px solid #ef4444",
                borderRadius: 6,
                padding: "12px 14px",
                textAlign: "center",
                boxShadow: "0 0 18px rgba(239,68,68,0.35)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#7f1d1d", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>⚠️ SUSPECT PRINCIPAL</div>
                <div style={{ fontSize: 22, marginBottom: 6 }}>👤</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#991b1b", fontFamily: "monospace" }}>PIERRE DUBOIS</div>
                <div style={{ fontSize: 10, color: "#b91c1c", fontFamily: "monospace", marginTop: 4 }}>pdubois  •  IP: 192.168.1.105</div>
                <div style={{ fontSize: 9, color: "#ef4444", marginTop: 6, fontStyle: "italic" }}>Accès non autorisé — données sensibles</div>
              </div>
            )}

            {/* TIMELINE */}
            {item.kind === "timeline" && (
              <div style={{
                background: "#0f172a",
                border: "1px solid #1e3a8a",
                borderRadius: 4,
                padding: "10px 12px",
                color: "#e2e8f0",
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#60a5fa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, borderBottom: "1px solid #1e3a8a", paddingBottom: 5 }}>
                  ⏱ CHRONOLOGIE — 15 MARS
                </div>
                {[
                  ["17:45", "Connexion RDP", "#fde68a"],
                  ["18:00", "DL client_db.sql", "#ef4444"],
                  ["18:15", "DL payments.xlsx", "#ef4444"],
                  ["18:30", "DL health_records", "#ef4444"],
                  ["18:45", "Déconnexion RDP", "#94a3b8"],
                ].map(([time, action, color], i) => (
                  <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4, fontSize: 10 }}>
                    <span style={{ color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>{time}</span>
                    <span style={{ color }}>{action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Bouton fermer ── */}
      <div style={{ position: "absolute", top: 12, right: "5.8%", zIndex: 50 }}>
        <button
          onClick={onClose}
          style={{
            border: "1px solid rgba(253,230,138,0.4)",
            background: "rgba(20,10,4,0.8)",
            color: "#fde68a",
            borderRadius: 8,
            padding: "7px 15px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            backdropFilter: "blur(4px)",
          }}
        >
          ✕ Quitter la salle
        </button>
      </div>

      {/* ── Label titre bas tableau ── */}
      <div style={{
        position: "absolute", bottom: "10.5%", left: "50%", transform: "translateX(-50%)",
        background: "rgba(10,5,2,0.85)",
        border: "1px solid rgba(253,230,138,0.3)",
        borderRadius: 6,
        padding: "5px 18px",
        color: "#fde68a",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        zIndex: 40,
      }}>
        🔍 Tableau d'enquête — Incident Fuite de Données — 15 Mars 2026
      </div>

      {/* ── Popup contact ── */}
      {popup === "contact" && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 60,
            background: "rgba(5,2,0,0.7)",
            backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setPopup(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(480px, 93vw)",
              background: "linear-gradient(160deg, #1c0f04 0%, #2d1a08 100%)",
              border: "1px solid rgba(253,230,138,0.45)",
              borderRadius: 16,
              padding: "34px 30px",
              color: "#fde68a",
              boxShadow: "0 40px 90px rgba(0,0,0,0.7)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>💬</div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 22, color: "#fde68a" }}>
              Vous souhaitez aller plus loin ?
            </h2>
            <p style={{ color: "#fcd34d", lineHeight: 1.78, margin: "0 0 18px 0", fontSize: 15 }}>
              Ce tableau d'enquête fait partie d'un exercice de mise en situation cyber conçu par{" "}
              <strong>Eddy MISSONI</strong>. Pour explorer d'autres scénarios, collaborer ou échanger
              sur la cybersécurité et la data :
            </p>
            <p style={{ color: "#e2e8f0", margin: "0 0 26px 0", fontSize: 14 }}>
              👉 <strong>Contactez-moi</strong> via le formulaire du portfolio — je serai ravi d'en discuter avec vous.
            </p>
            <button
              onClick={() => setPopup(null)}
              style={{
                padding: "11px 30px",
                background: "rgba(253,230,138,0.12)",
                border: "1px solid rgba(253,230,138,0.5)",
                color: "#fde68a",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EscapeGame3D() {
  const [activePropId, setActivePropId] = useState(null);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [activeDesktopItemId, setActiveDesktopItemId] = useState(null);
  const [propViewMode, setPropViewMode] = useState("perspective");
  const [message, setMessage] = useState(
    "Explore autour de la table: objets a lire sur Cyber, IA, Data. Clique l'ecran pour ouvrir le bureau Windows."
  );

  const activeProp = useMemo(
    () => TABLE_PROPS.find((entry) => entry.id === activePropId) || null,
    [activePropId]
  );
  const activeDesktopItem = useMemo(
    () => DESKTOP_ITEMS.find((entry) => entry.id === activeDesktopItemId) || null,
    [activeDesktopItemId]
  );

  const openProp = (propId) => {
    setActivePropId(propId);
    const found = TABLE_PROPS.find((entry) => entry.id === propId);
    setPropViewMode("perspective");
    
    // Cyber book → open investigation board
    if (found?.id === "book-cyber") {
      setActivePropId(null);
      setDesktopOpen(false);
      setInvestigationOpen(true);
      setMessage("Salle d'enquête ouverte — explorez le tableau des indices");
    } else {
      setInvestigationOpen(false);
      if (found) setMessage(`Objet inspecte: ${found.name}`);
    }
  };

  const openDesktop = () => {
    setActivePropId(null);
    setDesktopOpen(true);
    setInvestigationOpen(false);
    setActiveDesktopItemId(null);
    setMessage("Bureau ouvert. Clique un dossier pour l'explorer.");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        borderRadius: 0,
        overflow: "hidden",
        border: "none",
        background: "#02030a",
      }}
    >
      <Canvas shadows camera={{ position: [0, 2.4, 4.8], fov: 62 }} style={{ width: "100%", height: "100vh" }}>
        <Suspense fallback={null}>
          <Scene onOpenDesktop={openDesktop} onOpenProp={openProp} />
        </Suspense>
      </Canvas>

      {activeProp && !desktopOpen && !investigationOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2,6,23,0.84)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 220,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(720px, 95vw)",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 14,
              border: "1px solid rgba(125,211,252,0.4)",
              background: "linear-gradient(170deg, rgba(10,18,36,0.98) 0%, rgba(2,6,23,0.98) 100%)",
              boxShadow: "0 30px 80px rgba(2,132,199,0.26)",
              padding: 22,
              color: "#e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{activeProp.name}</h2>
              <button
                onClick={() => setActivePropId(null)}
                style={{
                  border: "1px solid rgba(148,163,184,0.45)",
                  background: "rgba(15,23,42,0.75)",
                  color: "#e2e8f0",
                  borderRadius: 8,
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {[
                  { id: "front", label: "Vue face" },
                  { id: "side", label: "Vue profil" },
                  { id: "top", label: "Vue dessus" },
                  { id: "perspective", label: "Vue perspective" },
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setPropViewMode(view.id)}
                    style={{
                      border: propViewMode === view.id ? "1px solid rgba(56,189,248,0.9)" : "1px solid rgba(148,163,184,0.45)",
                      background: propViewMode === view.id ? "rgba(14,165,233,0.2)" : "rgba(15,23,42,0.75)",
                      color: "#e2e8f0",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {view.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  height: 280,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(125,211,252,0.25)",
                  background: "#020617",
                  marginBottom: 10,
                }}
              >
                <Canvas camera={{ position: [1.1, 0.8, 1.2], fov: 45 }} shadows>
                  <PropPreviewScene item={activeProp} viewMode={propViewMode} />
                </Canvas>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#bae6fd" }}>
                Glisse avec la souris pour manipuler l'objet, puis zoome/dezoome pour l'inspecter sous tous les angles.
              </p>
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontSize: 13,
                background: "rgba(4,10,24,0.8)",
                border: "1px solid rgba(125,211,252,0.2)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              {activeProp.info}
            </pre>
            <div
              style={{
                marginTop: 12,
                background: "rgba(14,165,233,0.1)",
                border: "1px solid rgba(125,211,252,0.2)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.7,
                color: "#bae6fd",
              }}
            >
              Si vous souhaitez aller plus loin sur cet élément, vous pouvez me contacter via le formulaire du portfolio.
            </div>
          </div>
        </div>
      )}

      {desktopOpen && (
        <DesktopWorkspace
          items={DESKTOP_ITEMS}
          activeItem={activeDesktopItem}
          onOpenItem={(itemId) => setActiveDesktopItemId(itemId)}
          onClearItem={() => setActiveDesktopItemId(null)}
          onClose={() => {
            setDesktopOpen(false);
            setActiveDesktopItemId(null);
            setMessage("Retour à la salle.");
          }}
        />
      )}

      {investigationOpen && (
        <EvidenceBoard
          onClose={() => {
            setInvestigationOpen(false);
            setActiveDesktopItemId(null);
            setMessage("Retour à la salle.");
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          maxWidth: "min(900px, calc(100% - 28px))",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(30,41,59,0.76)",
            border: "1px solid rgba(191,219,254,0.45)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#93c5fd",
              letterSpacing: 1,
              marginBottom: 5,
            }}
          >
            ESCAPE OPS 3D · TABLE ANALYSTE
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</div>
          <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>
            Survole et clique les objets · Clique l'ecran pour entrer dans le bureau
          </div>
        </div>
      </div>
    </div>
  );
}
