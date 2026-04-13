//Funciones de conexión con el API de DUMMYJSON

const BASE_URL = 'https://dummyjson.com';

// GET - Obtener lista de posts con paginación
const getPosts = async (limit = 10, skip = 0) => {
    const response = await fetch(`${BASE_URL}/posts?limit=${limit}&skip=${skip}`);
    
    if (!response.ok) {
        throw new Error('Error al cargar los posts');
    }
    
    const data = await response.json();
    return data;
};

// GET - Obtener un post por ID
const getPostById = async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    
    if (!response.ok) {
        throw new Error('Error al cargar el post');
    }
    
    const data = await response.json();
    return data;
};

// GET - Obtener información de un usuario
const getUserById = async (id) => {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    
    if (!response.ok) {
        throw new Error('Error al cargar el usuario');
    }
    
    const data = await response.json();
    return data;
};

// GET - Buscar posts por texto
const searchPosts = async (query) => {
    const response = await fetch(`${BASE_URL}/posts/search?q=${query}`);
    
    if (!response.ok) {
        throw new Error('Error en la búsqueda');
    }
    
    const data = await response.json();
    return data;
};

// GET - Obtener posts por tag
const getPostsByTag = async (tag) => {
    const response = await fetch(`${BASE_URL}/posts/tag/${tag}`);
    
    if (!response.ok) {
        throw new Error('Error al filtrar por tag');
    }
    
    const data = await response.json();
    return data;
};

// GET - Obtener posts por usuario
const getPostsByUser = async (userId) => {
    const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
    
    if (!response.ok) {
        throw new Error('Error al filtrar por usuario');
    }
    
    const data = await response.json();
    return data;
};

// GET - Obtener lista de todos los tags
const getAllTags = async () => {
    const response = await fetch(`${BASE_URL}/posts/tags`);
    
    if (!response.ok) {
        throw new Error('Error al cargar los tags');
    }
    
    const data = await response.json();
    return data;
};

// POST - Crear un nuevo post
const createPost = async (postData) => {
    const response = await fetch(`${BASE_URL}/posts/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
        throw new Error('Error al crear el post');
    }
    
    const data = await response.json();
    return data;
};

// PUT - Actualizar un post existente
const updatePost = async (id, postData) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
        throw new Error('Error al actualizar el post');
    }
    
    const data = await response.json();
    return data;
};

// DELETE - Eliminar un post
const deletePost = async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error('Error al eliminar el post');
    }
    
    const data = await response.json();
    return data;
};

// Exportar funciones
export {
    getPosts,
    getPostById,
    getUserById,
    searchPosts,
    getPostsByTag,
    getPostsByUser,
    getAllTags,
    createPost,
    updatePost,
    deletePost
};