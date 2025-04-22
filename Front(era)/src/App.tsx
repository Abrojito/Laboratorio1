import WelcomePage from './pages/WelcomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UpdateProfile from './pages/auth/UpdateProfile';
import DeleteAccount from './components/DeleteAccount';
import Home from './pages/Home';
import Ingredient from './pages/Ingredient.tsx';
import Splash from "./pages/Splash.tsx";
import NewRecipeForm from "./pages/RecipeForm.tsx";
import Profile from "./pages/Profile.tsx"

import { Navigate, Route, Routes} from "react-router-dom";


const App: React.FC = () => {
    return (

                    <Routes>

                        <Route path="" element={<Splash />} />

                        {/* Página de bienvenida */}
                        <Route path="/start" element={<WelcomePage />} />

                        {/* Rutas públicas */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Rutas protegidas */}
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile/update" element={<UpdateProfile />} />
                        <Route path="/delete-account" element={<DeleteAccount />} />
                        <Route path="/profile" element={<Profile />} />

                        {/* Rutas de recetas */}
                        <Route
                            path="/newrecipe"
                            element={

                                    <NewRecipeForm />

                            }/>

                        {/* Rutas de ingredientes */}
                        <Route path="/ingredients" element={<Ingredient  />} />

                        {/* Redirección por defecto */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
    );
};

export default App;