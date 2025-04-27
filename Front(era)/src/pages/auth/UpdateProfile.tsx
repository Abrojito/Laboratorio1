import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProfile: React.FC = () => {
    const navigate = useNavigate();
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPhoto, setNewPhoto] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) setError("Debes iniciar sesión primero");
    }, [token]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token) return;

        const updateData: any = {};
        if (newUsername) updateData.username = newUsername;
        if (newEmail) updateData.email = newEmail;
        if (newPassword) updateData.password = newPassword;
        if (newPhoto) updateData.photo = newPhoto;

        console.log("Token que estoy mandando:", token);

        const response = await fetch("http://localhost:8080/api/users/me/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(updateData),
        });

        if (response.ok) {
            setSuccess("Perfil actualizado exitosamente.");
            setTimeout(() => navigate("/profile"), 1500);
        } else {
            const errorText = await response.text();
            setError("Error al actualizar: " + errorText);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Actualizar Perfil</h2>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <label style={styles.label}>Nombre</label>
                <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={styles.input}
                    placeholder="Nuevo nombre"
                />

                <label style={styles.label}>Email</label>
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Nuevo email"
                />

                <label style={styles.label}>Contraseña</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Nueva contraseña"
                />

                <label style={styles.label}>Foto de perfil</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: "1rem" }} />

                <button type="submit" style={styles.button}>
                    Actualizar Perfil
                </button>
            </form>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#ffffff",
    },
    form: {
        background: "#fafafa",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
        width: "90%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: 600,
        marginBottom: "1rem",
        textAlign: "center",
    },
    label: {
        fontSize: "0.9rem",
        fontWeight: 500,
    },
    input: {
        padding: "0.5rem 0.75rem",
        fontSize: "1rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontFamily: "'Albert Sans', sans-serif",
    },
    button: {
        padding: "0.6rem",
        backgroundColor: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 500,
    },
    error: {
        backgroundColor: "#fdd",
        padding: "0.5rem",
        borderRadius: "6px",
        color: "#800",
        fontSize: "0.9rem",
        textAlign: "center",
    },
    success: {
        backgroundColor: "#dfd",
        padding: "0.5rem",
        borderRadius: "6px",
        color: "#060",
        fontSize: "0.9rem",
        textAlign: "center",
    },
};

export default UpdateProfile;