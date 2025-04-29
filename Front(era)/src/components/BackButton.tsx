import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                color: '#A6B240',
                position: 'absolute',
                top: '20px',
                left: '20px',
            }}
        >
            ←
        </button>
    );
};

export default BackButton;
