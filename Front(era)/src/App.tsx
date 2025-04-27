/* App.tsx */
import { Routes, Route, Navigate } from 'react-router-dom';

import Splash         from './pages/Splash';
import WelcomePage    from './pages/WelcomePage';
import Login          from './pages/auth/Login';
import Signup         from './pages/auth/Signup';
import UpdateProfile  from './pages/auth/UpdateProfile';
import DeleteAccount  from './components/DeleteAccount';
import Home           from './pages/Home';
import Ingredient     from './pages/Ingredient';
import NewRecipeForm  from './pages/RecipeForm';
import Profile        from './pages/Profile';
import MyRecipes      from './pages/MyRecipes';

import { ProtectedRoute, GuestOnlyRoute } from './router/guards';   // 👈 new

const App: React.FC = () => (
    <Routes>
        {/* -------- Splash (sin restricción) -------- */}
        <Route path="" element={<Splash />} />

        {/* -------- Rutas solo para invitados -------- */}
        <Route element={<GuestOnlyRoute />}>
            <Route path="/start"  element={<WelcomePage />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
        </Route>

        {/* -------- Rutas protegidas (requieren token) -------- */}
        <Route element={<ProtectedRoute />}>
            <Route path="/home"            element={<Home />} />
            <Route path="/newrecipe"       element={<NewRecipeForm />} />
            <Route path="/ingredients"     element={<Ingredient />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/me/myrecipes"    element={<MyRecipes />} />
            <Route path="/me/update"       element={<UpdateProfile />} />
            <Route path="/delete-account"  element={<DeleteAccount />} />
        </Route>

        {/* -------- Catch-all -------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default App;
