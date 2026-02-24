import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { useModal } from "../../context/ModalContext";

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const GOOGLE_SCRIPT_ID = "google-gis-script";

type GoogleCredentialResponse = {
    credential?: string;
};

declare global {
    interface Window {
        google?: any;
    }
}

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { alert } = useModal();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    const googleInitializedRef = useRef(false);
    const googleButtonRenderedRef = useRef(false);
    const googleButtonHostRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            console.log('Login exitoso:', data);


            localStorage.setItem('token', data.token);

            navigate('/home'); // Redirigir a la página principal después de iniciar sesión
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleResponse = useCallback(async (googleResponse: GoogleCredentialResponse) => {
        const idToken = googleResponse.credential;
        if (!idToken) {
            setError("Google no devolvió credenciales.");
            await alert({ title: "Login", message: "Google no devolvió credenciales." });
            return;
        }

        setLoading(true);
        setError("");

        try {
            const apiResponse = await fetch(`${BASE}/api/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });

            if (!apiResponse.ok) {
                throw new Error("No se pudo iniciar sesión con Google");
            }

            const data = await apiResponse.json();
            localStorage.setItem("token", data.token);
            navigate("/home");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al iniciar sesión con Google";
            setError(message);
            await alert({ title: "Login", message });
        } finally {
            setLoading(false);
        }
    }, [alert, navigate]);

    const initializeGoogle = useCallback(() => {
        if (!googleClientId || !window.google?.accounts?.id || googleInitializedRef.current) {
            return;
        }

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
        });

        googleInitializedRef.current = true;

        const container = googleButtonHostRef.current;
        if (container && !googleButtonRenderedRef.current) {
            container.innerHTML = "";
            window.google.accounts.id.renderButton(container, {
                theme: "outline",
                size: "large",
                width: 320,
            });
            googleButtonRenderedRef.current = true;
        }
    }, [googleClientId, handleGoogleResponse]);

    useEffect(() => {
        if (!googleClientId) return;

        if (window.google?.accounts?.id) {
            initializeGoogle();
            return;
        }

        const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
        const onLoad = () => initializeGoogle();

        if (existingScript) {
            existingScript.addEventListener("load", onLoad);
            return () => existingScript.removeEventListener("load", onLoad);
        }

        const script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = onLoad;
        script.onerror = () => {
            setError("No se pudo cargar Google Identity Services.");
        };
        document.body.appendChild(script);

        return () => {
            script.onload = null;
            script.onerror = null;
        };
    }, [googleClientId, initializeGoogle]);

    const handleGoogleButtonClick = async () => {
        if (!googleClientId) {
            const message = "Falta configurar VITE_GOOGLE_CLIENT_ID";
            setError(message);
            await alert({ title: "Login", message });
            return;
        }
        if (!googleButtonHostRef.current) {
            const message = "Google Identity Services no está disponible todavía.";
            setError(message);
            await alert({ title: "Login", message });
            return;
        }

        const target = googleButtonHostRef.current.querySelector("div[role='button']") as HTMLElement | null;
        if (!target) {
            const message = "No se pudo iniciar el login con Google.";
            setError(message);
            await alert({ title: "Login", message });
            return;
        }

        target.click();
    };

    return (
        <div className="auth-form">
            <h1>Welcome back!</h1>
            {error && <p className="error-text">{error}</p>}
            <p>Login to your Dishly account</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Login'}
                </button>

                <button
                    type="button"
                    className="btn-google"
                    onClick={handleGoogleButtonClick}
                    disabled={loading}
                    aria-label="Iniciar sesión con Google"
                >
                    <span className="btn-google-icon" aria-hidden="true">G</span>
                    <span className="btn-google-text">Iniciar sesión con Google</span>
                </button>

                <div ref={googleButtonHostRef} id="googleSignInDiv" className="google-signin-hidden"></div>

                <button type="button" className="button-signup" onClick={() => navigate('/signup')}>Signup</button>
            </form>
        </div>
    );
};

export default Login;
