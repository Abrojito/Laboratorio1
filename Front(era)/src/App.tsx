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

import { ProtectedRoute, GuestOnlyRoute } from './router/guards';
import RecipeDetail from "./pages/RecipeDetail.tsx";
import EditRecipeForm from "./pages/EditRecipeForm.tsx";


import MealPrepForm from "./pages/MealPrepForm";
import MyMealPreps from "./pages/MyMealPreps";
import MealPrepDetail from "./pages/MealPrepDetail";
import EditMealPrepForm from "./pages/EditMealPrepForm.tsx";
import ShoppingListPage from "./pages/ShoppingListPage.tsx";
import ShoppingListDetailPage from "./pages/ShoppingListDetailPage.tsx";
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import CollectionsPage from "./pages/CollectionsPage.tsx";



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
            <Route path="/me/my-mealpreps" element={<MyMealPreps />} />
            <Route path="/new-mealprep"    element={<MealPrepForm />} />
            <Route path="/me/update"       element={<UpdateProfile />} />
            <Route path="/delete-account"  element={<DeleteAccount />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/:id/reviews" element={<RecipeDetail />} />
            <Route path="/recipes/:id/edit" element={<EditRecipeForm />} />
            <Route path="/mealpreps/:id/edit" element={<EditMealPrepForm />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/shopping-list/:id" element={<ShoppingListDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
        </Route>

        {/* -------- Rutas públicas (visibles por todos) -------- */}
        <Route path="/mealpreps/:id" element={<MealPrepDetail />} />

        {/* -------- Catch-all -------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default App;
