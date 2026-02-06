import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const MEMBERS = [
  {
    id: "sarah",
    name: "AMEDJRANA MBOULA Emmanuel Noé",
    role: "Développeur web",
    email: "amedjrananoe@gmail.com",
    photo: "/members/sarah.jpg",
    profile: "Je suis un étudiant en troisième année de génie-informatique avec quelques connaissances en réseau et enprogrammation. A la recherche d’un stage pour ma soutenance et dans le but est d’approfondir mes connaissances ainsi que d’acquérir une expérience enentreprise.",
    skills: ["React", "Node.js", "JavaScript", "TypeScript", "Firebase", "MongoDB"],
  },
  {
    id: "marc",
    name: "GOMA MBA Delva david",
    role: "Développeur Fullstack",
    email: "marc@equipe.com",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    profile: "Expert en interfaces utilisateur avec un œil pour le détail. Transforme les maquettes en expériences web fluides et accessibles.",
    skills: ["HTML/CSS", "JavaScript", "Vue.js", "Tailwind CSS", "Animation CSS", "Responsive Design"],
  },
  {
    id: "ines",
    name: "Naazil ibouraima",
    role: "Product Designer",
    email: "ines@equipe.com",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
    profile: "Designer centrée sur l'utilisateur. Crée des produits digitaux intuitifs en alliant esthétique et fonctionnalité.",
    skills: ["Figma", "UI/UX Design", "Prototypage", "Design System", "Recherche Utilisateur", "Adobe XD"],
  },
  {
    id: "lucas",
    name: "MOUNGONGA KOUMBA Dani-Thérence",
    role: "Développeur ",
    email: "lucas@equipe.com",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
    profile: "Architecte full-stack capable de gérer l'ensemble d'un projet, de la base de données à l'interface. Passionné par les solutions scalables.",
    skills: ["Python", "Django", "React", "PostgreSQL", "AWS", "Docker", "API REST"],
  },
  {
    id: "amelie",
    name: "guibotsi bohono freddy landry ",
    role: "Développeur",
    email: "amelie@equipe.com",
    photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=500&q=80",
    profile: "Donné vie aux interfaces avec des animations captivantes. Spécialiste en motion design pour web et applications mobiles.",
    skills: ["Python", "Django", "React", "PostgreSQL", "SVG Animation"],
  },
];

// Projets en dur dans le code - modifiez ici pour ajouter/modifier des projets
const INITIAL_PROJECTS = {
  sarah: [
    {
      id: "proj-1",
      title: "IMMOCO",
      description: "Cette application immobilière permet de consulter, publier et gérer des biens immobiliers facilement.\nElle offre une interface moderne et intuitive adaptée aux utilisateurs.\nLes agents et propriétaires peuvent ajouter des annonces avec descriptions et images.\nLes clients peuvent rechercher des biens selon leurs besoins.\nL’application simplifie et digitalise la gestion immobilière.",
      mediaUrl: "https://res.cloudinary.com/dxaxwiqat/video/upload/v1770370099/Enregistrement_de_l_%C3%A9cran_2026-02-06_081222_h57ecw.mp4",
      externalUrl: "https://immoco.vercel.app/",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
    },
  ],
  marc: [
    {
      id: "proj-2",
      title: "VACILOC",
      description: "Dashboard de visualisation de données avec graphiques interactifs.",
      mediaUrl: "https://res.cloudinary.com/dxaxwiqat/video/upload/v1770392022/WhatsApp_Video_2026-02-06_at_15.14.11_fay2jj.mp4",
      externalUrl: "www.vaciloc.com",
      createdAt: "2024-02-01T14:30:00.000Z",
      updatedAt: "2024-02-01T14:30:00.000Z",
    },
  ],
  ines: [
  {   id: "proj-3",
      title: "IUFMES",
      description: "Site vitrine",
      mediaUrl: "https://res.cloudinary.com/dxaxwiqat/video/upload/v1770392023/WhatsApp_Video_2026-02-06_at_15.19.12_kk8v73.mp4",
      externalUrl: "www.iufme.com",
      createdAt: "2024-02-01T14:30:00.000Z",
      updatedAt: "2024-02-01T14:30:00.000Z",
  },
  ],
  lucas: [],
  amelie: [],
};

const emptyForm = {
  title: "",
  description: "",
  mediaUrl: "",
  externalUrl: "",
};

const getMediaType = (url) => {
  if (!url) return "";
  const lower = url.toLowerCase();
  if (lower.includes("/video/upload/")) return "video";
  if (lower.match(/\.(mp4|webm|ogg)(\?.*)?$/)) return "video";
  return "image";
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectsByMember, setProjectsByMember] = useState({});
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });

  const memberByEmail = useMemo(() => {
    const map = new Map();
    MEMBERS.forEach((member) => map.set(member.email, member));
    return map;
  }, []);

  const currentMember = useMemo(() => {
    if (!user?.email) return null;
    return memberByEmail.get(user.email) || null;
  }, [user, memberByEmail]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Initialisation des projets depuis les données statiques
  useEffect(() => {
    setProjectsByMember(INITIAL_PROJECTS);
  }, []);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    try {
      if (authMode === "signup") {
        await createUserWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password
        );
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthError("Impossible de se connecter. Vérifiez vos identifiants.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    if (!currentMember) return;

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        mediaUrl: formData.mediaUrl.trim(),
        externalUrl: formData.externalUrl.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Modification d'un projet existant
        setProjectsByMember((prev) => {
          const existing = prev[currentMember.id] || [];
          return {
            ...prev,
            [currentMember.id]: existing.map((project) =>
              project.id === editingId ? { ...project, ...payload } : project
            ),
          };
        });
      } else {
        // Ajout d'un nouveau projet
        const newId = `proj-${Date.now()}`;
        setProjectsByMember((prev) => {
          const existing = prev[currentMember.id] || [];
          return {
            ...prev,
            [currentMember.id]: [
              { id: newId, ...payload, createdAt: new Date().toISOString() },
              ...existing,
            ],
          };
        });
      }

      setFormData(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      mediaUrl: project.mediaUrl || "",
      externalUrl: project.externalUrl || "",
    });
  };

  const handleDelete = (projectId) => {
    if (!currentMember) return;
    setProjectsByMember((prev) => {
      const existing = prev[currentMember.id] || [];
      return {
        ...prev,
        [currentMember.id]: existing.filter((project) => project.id !== projectId),
      };
    });
  };

  return (
    <div className="app">
      <header className="hero" id="accueil">
        <nav className="nav">
          <div className="logo">Teamfolio</div>
          <div className="nav-links">
            <a href="#accueil">Accueil</a>
            <a href="#projets">Projets</a>
            <a href="#apropos">À propos</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-auth">
            {user ? (
              <button className="ghost" onClick={handleLogout}>
                Se déconnecter
              </button>
            ) : null}
          </div>
        </nav>
        <div className="hero-content">
          <p className="eyebrow">Portfolio collaboratif</p>
          <h1>Une équipe, cinq expertises, une vitrine partagée.</h1>
          <p className="lead">
            Chaque membre garde la main sur ses projets, tout en construisant une
            présence commune élégante et cohérente.
          </p>
          <div className="hero-badges">
            <span>UX & Design</span>
            <span>Développement</span>
            <span>Motion</span>
          </div>
        </div>
      </header>

      <section className="members" aria-label="Membres">
        <h2>Les 5 membres</h2>
        <div className="members-grid">
          {MEMBERS.map((member) => (
            <article className="member-card" key={member.id}>
              <img src={member.photo} alt={member.name} />
              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-profile">{member.profile}</p>
                <div className="member-skills">
                  {member.skills.map((skill) => (
                    <span key={skill} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="projects" id="projets">
        <div className="section-header">
          <div>
            <p className="eyebrow">Projets</p>
            <h2>Les projets de l’équipe</h2>
          </div>
          {user ? (
            <div className="user-chip">
              Connecté en tant que <strong>{user.email}</strong>
            </div>
          ) : null}
        </div>

        <div className="projects-layout">
          <div className="projects-list">
            {MEMBERS.map((member) => (
              <div key={member.id} className="member-projects">
                <div className="member-projects-header">
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                </div>
                <div className="project-cards">
                  {(projectsByMember[member.id] || []).map((project) => (
                    <article className="project-card" key={project.id}>
                      {project.mediaUrl ? (
                        getMediaType(project.mediaUrl) === "video" ? (
                          <video
                            controls
                            preload="metadata"
                            playsInline
                            className="project-media"
                          >
                            <source src={project.mediaUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={project.mediaUrl}
                            alt={project.title}
                            className="project-media"
                          />
                        )
                      ) : (
                        <div className="project-media placeholder">Aperçu</div>
                      )}
                      <div className="project-body">
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        {project.externalUrl ? (
                          <a
                            href={project.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Voir le projet
                          </a>
                        ) : null}
                      </div>
                      {currentMember?.id === member.id ? (
                        <div className="project-actions">
                          <button
                            className="ghost"
                            onClick={() => handleEdit(project)}
                          >
                            Modifier
                          </button>
                          <button
                            className="danger"
                            onClick={() => handleDelete(project.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                  {(projectsByMember[member.id] || []).length === 0 ? (
                    <div className="empty">Aucun projet pour le moment.</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <aside className="project-form">
            <h3>Ajouter / Modifier un projet</h3>
            {!user ? (
              <div className="auth-panel">
                <p className="auth-title">Connexion membre</p>
                <form onSubmit={handleAuthSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Mot de passe
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  {authError ? <p className="error">{authError}</p> : null}
                  <button type="submit">
                    {authMode === "signup" ? "Créer un compte" : "Se connecter"}
                  </button>
                </form>
                <button
                  className="link"
                  onClick={() =>
                    setAuthMode((prev) =>
                      prev === "signup" ? "login" : "signup"
                    )
                  }
                >
                  {authMode === "signup"
                    ? "Déjà un compte ? Se connecter"
                    : "Nouveau ? Créer un compte"}
                </button>
                <p className="hint">
                  Utilisez l’un des emails des 5 membres pour vous connecter.
                </p>
              </div>
            ) : currentMember ? (
              <form onSubmit={handleProjectSubmit}>
                <label>
                  Titre du projet
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Image ou vidéo (URL Cloudinary)
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        mediaUrl: event.target.value,
                      }))
                    }
                    placeholder="https://res.cloudinary.com/..."
                  />
                </label>
                <label>
                  Lien externe (optionnel)
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        externalUrl: event.target.value,
                      }))
                    }
                  />
                </label>
                <button type="submit">
                  {editingId ? "Mettre à jour" : "Ajouter le projet"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setFormData(emptyForm);
                    }}
                  >
                    Annuler
                  </button>
                ) : null}
              </form>
            ) : (
              <div className="auth-panel">
                <p className="error">
                  Ce compte n’est pas autorisé. Utilisez un email membre.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="about" id="apropos">
        <div>
          <p className="eyebrow">À propos</p>
          <h2>Une équipe pluridisciplinaire.</h2>
        </div>
        <p>
          Nous réunissons design, développement et storytelling visuel pour
          construire des expériences numériques mémorables. Chaque membre gère
          ses projets, mais l’ensemble raconte une vision commune.
        </p>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Travaillons ensemble</h2>
          <p>
            Écrivez-nous à <strong>hello@teamfolio.com</strong> ou contactez
            directement l’un des membres.
          </p>
        </div>
        <button className="primary">Demander un devis</button>
      </section>

      <footer className="footer">© 2026 Teamfolio. Tous droits réservés.</footer>
    </div>
  );
}
