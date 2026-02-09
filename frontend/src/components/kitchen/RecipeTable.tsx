"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, BookOpen } from 'lucide-react';
import AddRecipeModal from './AddRecipeModal';

interface Recipe {
    id: number;
    name: string;
    category: string;
    image: string | null;
    ingredients: any[];
}

export default function RecipeTable() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const API_BASE_URL = 'http://localhost:3001';

    const fetchRecipes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes`);
            const data = await response.json();
            setRecipes(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleEditClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (id: number, name: string) => {
        if (window.confirm(`Hapus resep "${name}"?`)) {
            try {
                await fetch(`${API_BASE_URL}/recipes/${id}`, { method: 'DELETE' });
                fetchRecipes();
            } catch (error) {
                console.error('Error deleting recipe:', error);
            }
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <AddRecipeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchRecipes}
                initialData={selectedRecipe}
            />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={24} className="text-blue-600" />
                    Daftar Resep
                </h2>
                <div className="flex space-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari resep..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedRecipe(null); setIsAddModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} className="mr-1" /> Buat Resep
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Loading resep...</div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Belum ada resep.</div>
                ) : (
                    filteredRecipes.map((recipe) => (
                        <div key={recipe.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="aspect-video relative overflow-hidden bg-gray-100">
                                <img
                                    src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                                    alt={recipe.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(recipe)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-lg text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(recipe.id, recipe.name)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 shadow-sm hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{recipe.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{recipe.category || 'Resep General'}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-600 font-medium">{recipe.ingredients.length} Bahan</span>
                                    <button
                                        onClick={() => handleEditClick(recipe)}
                                        className="text-gray-400 hover:text-blue-600 font-medium"
                                    >
                                        Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
