//Punto de entrada de la aplicación

import { getPosts } from './api.js';

// Referencia al contenedor principal
const app = document.querySelector('#app');

// Estado de la aplicación
let state = {
    posts: [],
    currentPage: 0,
    postsPerPage: 10,
    totalPosts: 0,
    loading: false,
    error: null
};

// Función para mostrar estado de carga
const showLoading = () => {
    app.innerHTML = `
        <div class="loading">
            <p>Cargando posts...</p>
        </div>
    `;
};

// Función para mostrar errores
const showError = (message) => {
    app.innerHTML = `
        <div class="error">
            <p>Error ${message}</p>
            <button onclick="location.reload()">Reintentar</button>
        </div>
    `;
};

// Función para renderizar controles de paginación
const renderPagination = () => {
    const totalPages = Math.ceil(state.totalPosts / state.postsPerPage);
    const currentPageDisplay = state.currentPage + 1;
    
    const prevDisabled = state.currentPage === 0;
    const nextDisabled = state.currentPage >= totalPages - 1;
    
    return `
        <div class="pagination">
            <button class="btn-pagination" id="btn-prev" ${prevDisabled ? 'disabled' : ''}>
                ← Anterior
            </button>
            <span class="pagination-info">
                Página ${currentPageDisplay} de ${totalPages}
            </span>
            <button class="btn-pagination" id="btn-next" ${nextDisabled ? 'disabled' : ''}>
                Siguiente →
            </button>
        </div>
    `;
};

// Función para renderizar la lista de posts
const renderPosts = (posts) => {
    if (posts.length === 0) {
        app.innerHTML = `
            <div class="empty">
                <p>No se encontraron posts.</p>
            </div>
        `;
        return;
    }

    const postsHTML = posts.map(post => `
        <article class="post-card">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-body">${post.body.substring(0, 100)}...</p>
            <div class="post-meta">
                <span class="post-tags">🏷️ ${post.tags.join(', ')}</span>
                <span class="post-reactions">👍 ${post.reactions.likes} | 👎 ${post.reactions.dislikes}</span>
            </div>
            <button class="btn-detail" data-id="${post.id}">Ver detalle</button>
        </article>
    `).join('');

    app.innerHTML = `
        <section class="posts-container">
            <h2>Publicaciones</h2>
            <div class="posts-grid">
                ${postsHTML}
            </div>
            ${renderPagination()}
        </section>
    `;
    
    // Agregar event listeners a los botones de paginación
    setupPaginationListeners();
};

// Configurar listeners de paginación
const setupPaginationListeners = () => {
    const btnPrev = document.querySelector('#btn-prev');
    const btnNext = document.querySelector('#btn-next');
    
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (state.currentPage > 0) {
                state.currentPage--;
                loadPosts();
            }
        });
    }
    
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const totalPages = Math.ceil(state.totalPosts / state.postsPerPage);
            if (state.currentPage < totalPages - 1) {
                state.currentPage++;
                loadPosts();
            }
        });
    }
};

// Función principal para cargar posts
const loadPosts = async () => {
    try {
        showLoading();
        
        const skip = state.currentPage * state.postsPerPage;
        const data = await getPosts(state.postsPerPage, skip);
        
        state.posts = data.posts;
        state.totalPosts = data.total;
        
        renderPosts(state.posts);
        
    } catch (error) {
        showError(error.message);
    }
};

// Inicializar la aplicación
const init = () => {
    loadPosts();
};

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);