import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";

const ALLOWED = [
  "brhnyc1970@gmail.com",
  "nico@humbleconviction.com",
  "nmejiawork@gmail.com",
];

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u && !ALLOWED.includes(u.email)) {
        signOut(auth);
        setError("Access restricted to team members.");
        setUser(null);
      } else {
        setUser(u);
        setError(null);
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError(e.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Eddy</h1>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 500, letterSpacing: 0.5 }}>
              Course Launch Tracker
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px", lineHeight: 1.6 }}>
            Sign in with your Google account to continue.
          </p>
          {error && (
            <div style={styles.error}>{error}</div>
          )}
          <button onClick={handleLogin} style={styles.button}>
            <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={user.photoURL}
            alt=""
            style={{ width: 22, height: 22, borderRadius: "50%" }}
            referrerPolicy="no-referrer"
          />
          <span style={{ fontSize: 12, color: "#777" }}>{user.email}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          style={{ fontSize: 11, color: "#bbb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8f7f4",
    fontFamily: "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e6e1",
    borderRadius: 12,
    padding: "36px 40px",
    maxWidth: 380,
    width: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    background: "#fff",
    color: "#333",
    border: "1px solid #e0ded8",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  error: {
    fontSize: 12,
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 16,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 28px",
    borderBottom: "1px solid #f0eee9",
    background: "#fff",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #e8e6e1",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    margin: "20px auto",
  },
};
