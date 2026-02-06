import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";

const MEMBERS = [
  {
    id: "sarah",
    name: "Sarah N’Diaye",
    role: "Brand & UX Designer",
    email: "sarah@equipe.com",
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "marc",
    name: "Marc Dupont",
    role: "Développeur Frontend",
    email: "marc@equipe.com",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "ines",
    name: "Inès Hawa",
    role: "Product Designer",
    email: "ines@equipe.com",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "lucas",
    name: "Lucas Pereira",
    role: "Développeur Full-stack",
    email: "lucas@equipe.com",
    photo:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "amelie",
    name: "Amélie Benali",
    role: "Motion Designer",
    email: "amelie@equipe.com",
    photo:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=500&q=80",
  },
];

const emptyForm = {
  title: "",
  description: "",
  mediaUrl: "",
  externalUrl: "",
};

const getMediaType = (url) => {
  if (!url) return "";
  const lower = url.toLowerCase();
  if (lower.match(/\.(mp4|webm|ogg)$/)) return "video";
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

  useEffect(() => {
    const fetchAllProjects = async () => {
      const data = {};
      await Promise.all(
        MEMBERS.map(async (member) => {
          const snapshot = await getDocs(
            collection(db, "members", member.id, "projects")
          );
          data[member.id] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
        })
      );
      setProjectsByMember(data);
    };

    fetchAllProjects();
  }, []);

  const refreshMemberProjects = async (memberId) => {
    const snapshot = await getDocs(
      collection(db, "members", memberId, "projects")
    );
    setProjectsByMember((prev) => ({
      ...prev,
      [memberId]: snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })),
    }));
  };

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

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      mediaUrl: formData.mediaUrl.trim(),
      externalUrl: formData.externalUrl.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      await updateDoc(
        doc(db, "members", currentMember.id, "projects", editingId),
        payload
      );
    } else {
      await addDoc(collection(db, "members", currentMember.id, "projects"), {
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }

    await refreshMemberProjects(currentMember.id);
    setFormData(emptyForm);
    setEditingId(null);
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

  const handleDelete = async (projectId) => {
    if (!currentMember) return;
    await deleteDoc(doc(db, "members", currentMember.id, "projects", projectId));
    await refreshMemberProjects(currentMember.id);
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
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
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
                            src={project.mediaUrl}
                            controls
                            className="project-media"
                          />
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
                  Image ou vidéo (URL)
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        mediaUrl: event.target.value,
                      }))
                    }
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
