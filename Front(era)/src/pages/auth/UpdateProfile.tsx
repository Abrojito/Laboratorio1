import { useState } from 'react';
import { updateProfile } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const UpdateProfile = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No se encontró token.');
                return;
            }

            await updateProfile(username, password, photo, token);
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError('Error al actualizar el perfil.');
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setPhoto(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (<div>
        <BackButton />
        <div style={styles.container}>
            <h2 style={styles.title}>Actualizar Perfil</h2>

            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Nuevo nombre de usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="insertar nuevo nombre de usuario"
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Nueva Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="insertar nueva contraseña"
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Foto de Perfil</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={styles.fileInput}
                    />
                </div>

                <button type="submit" style={styles.button}>Actualizar Perfil</button>
            </form>
        </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        fontFamily: "'Albert Sans', sans-serif",
    },
    title: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#333',
    },
    error: {
        color: 'red',
        fontSize: '0.9rem',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as 'column',
    },
    label: {
        marginBottom: '0.5rem',
        fontWeight: '500',
        fontSize: '0.95rem',
        color: '#555',
    },
    input: {
        padding: '0.6rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        fontSize: '0.95rem',
    },
    fileInput: {
        padding: '0.6rem 0',
        fontSize: '0.95rem',
    },
    button: {
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#A6B240',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};

export default UpdateProfile;
