import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UpdateProfile from './pages/auth/UpdateProfile';
import DeleteAccount from './components/DeleteAccount';
import Home from './pages/Home';

import { Navigate, Route, Routes} from "react-router-dom";

const App: React.FC = () => {
    return (

                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Rutas protegidas */}
                        <Route path="/" element={

                                <Home />

                        } />
                        <Route path="/profile" element={

                                <UpdateProfile />

                        } />
                        <Route path="/delete-account" element={

                                <DeleteAccount />

                        } />

                        {/* Redirección por defecto */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
    );
};

export default App;