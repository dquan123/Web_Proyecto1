//Punto de entrada de la aplicación

import { getPosts, getPostById, getUserById, createPost, updatePost, deletePost, searchPosts, getPostsByTag, getAllTags } from './api.js';
import { validatePostForm, showFormErrors, clearAllErrors } from './validation.js';
import { showLoading, showError, showSuccess, renderPagination, renderFilters, renderPostsList, renderPostDetailHTML, renderCreateFormHTML, renderEditFormHTML, renderDeleteModal, renderStatsHTML } from './ui.js';
import { initRouter, navigateTo, updateActiveNav } from './router.js';

// Referencia al contenedor principal
const app = document.querySelector('#app');

// -------------------------------------------
// Estado de la aplicación
// -------------------------------------------
let state = {
    posts: [],
    allTags: [],
    currentPost: null,
    currentUser: null,
    currentView: 'home',
    currentPage: 0,
    postsPerPage: 10,
    totalPosts: 0,
    filters: {
        search: '',
        tag: '',
        userId: ''
    }
};

// -------------------------------------------
// Renderizar vista de posts con filtros y paginación
// -------------------------------------------
const renderPosts = (posts) => {
    const filtersHTML = renderFilters(state.allTags, state.filters);
    const postsHTML = renderPostsList(posts);
    const paginationHTML = renderPagination(state.currentPage, state.totalPosts, state.postsPerPage);

    if (posts.length === 0) {
        app.innerHTML = `
            <section class="posts-container">
                <h2>Publicaciones</h2>
                ${filtersHTML}
                <div class="empty">
                    <p>No se encontraron posts.</p>
                </div>
            </section>
        `;
    } else {
        app.innerHTML = `
            <section class="posts-container">
                <h2>Publicaciones</h2>
                ${filtersHTML}
                <div class="posts-grid">
                    ${postsHTML}
                </div>
                ${paginationHTML}
            </section>
        `;
    }

    setupPaginationListeners();
    setupDetailListeners();
    setupFilterListeners();
};

// -------------------------------------------
// Configurar listeners de filtros
// -------------------------------------------
const setupFilterListeners = () => {
    const btnApply = document.querySelector('#btn-apply-filters');
    const btnClear = document.querySelector('#btn-clear-filters');
    const searchInput = document.querySelector('#filter-search');

    if (btnApply) {
        btnApply.addEventListener('click', applyFilters);
    }

    if (btnClear) {
        btnClear.addEventListener('click', clearFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
};

// -------------------------------------------
// Aplicar filtros
// -------------------------------------------
const applyFilters = async () => {
    const search = document.querySelector('#filter-search').value.trim();
    const tag = document.querySelector('#filter-tag').value;
    const userId = document.querySelector('#filter-user').value.trim();

    state.filters = { search, tag, userId };
    state.currentPage = 0;

    try {
        showLoading();

        let data;

        if (search) {
            data = await searchPosts(search);
            state.posts = data.posts;
            state.totalPosts = data.total;
        } else if (tag) {
            data = await getPostsByTag(tag);
            state.posts = data.posts;
            state.totalPosts = data.total;
        } else if (userId) {
            const allData = await getPosts(100, 0);
            state.posts = allData.posts.filter(post => post.userId === parseInt(userId));
            state.totalPosts = state.posts.length;
        } else {
            await loadPosts();
            return;
        }

        if (search && tag) {
            state.posts = state.posts.filter(post => post.tags.includes(tag));
            state.totalPosts = state.posts.length;
        }
        if (search && userId) {
            state.posts = state.posts.filter(post => post.userId === parseInt(userId));
            state.totalPosts = state.posts.length;
        }
        if (tag && userId) {
            state.posts = state.posts.filter(post => post.userId === parseInt(userId));
            state.totalPosts = state.posts.length;
        }

        renderPosts(state.posts);

    } catch (error) {
        showError(error.message);
    }
};

// -------------------------------------------
// Limpiar filtros
// -------------------------------------------
const clearFilters = () => {
    state.filters = { search: '', tag: '', userId: '' };
    state.currentPage = 0;
    loadPosts();
};

// -------------------------------------------
// Configurar listeners de paginación
// -------------------------------------------
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

// -------------------------------------------
// Configurar listeners de botones "Ver detalle"
// -------------------------------------------
const setupDetailListeners = () => {
    const detailButtons = document.querySelectorAll('.btn-detail');

    detailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const postId = e.target.dataset.id;
            loadPostDetail(postId);
        });
    });
};

// -------------------------------------------
// Cargar detalle de un post
// -------------------------------------------
const loadPostDetail = async (id) => {
    try {
        showLoading();

        const post = await getPostById(id);
        const user = await getUserById(post.userId);

        state.currentPost = post;
        state.currentUser = user;
        state.currentView = 'detail';
        updateActiveNav();

        renderPostDetail(post, user);

    } catch (error) {
        showError(error.message);
    }
};

// -------------------------------------------
// Renderizar vista de detalle
// -------------------------------------------
const renderPostDetail = (post, user) => {
    app.innerHTML = renderPostDetailHTML(post, user);

    document.querySelector('#btn-back').addEventListener('click', () => {
        state.currentView = 'home';
        updateActiveNav();
        loadPosts();
    });

    document.querySelector('.btn-edit').addEventListener('click', () => {
        renderEditForm(post, user);
    });

    document.querySelector('.btn-delete').addEventListener('click', () => {
        showDeleteConfirm(post.id);
    });
};

// -------------------------------------------
// Mostrar confirmación de eliminar
// -------------------------------------------
const showDeleteConfirm = (postId) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = renderDeleteModal();
    document.body.appendChild(overlay);

    document.querySelector('#btn-cancel-delete').addEventListener('click', () => {
        overlay.remove();
    });

    document.querySelector('#btn-confirm-delete').addEventListener('click', async () => {
        await executeDelete(postId, overlay);
    });
};

// -------------------------------------------
// Ejecutar eliminación
// -------------------------------------------
const executeDelete = async (postId, overlay) => {
    try {
        const btnConfirm = document.querySelector('#btn-confirm-delete');
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Eliminando...';

        await deletePost(postId);

        overlay.remove();

        state.posts = state.posts.filter(post => post.id !== parseInt(postId));

        showSuccess('¡Publicación eliminada exitosamente!');

        setTimeout(() => {
            state.currentView = 'home';
            updateActiveNav();
            renderPosts(state.posts);
        }, 1000);

    } catch (error) {
        overlay.remove();
        showError('Error al eliminar: ' + error.message);
    }
};

// -------------------------------------------
// Renderizar formulario de crear post
// -------------------------------------------
const renderCreateForm = () => {
    state.currentView = 'create';
    updateActiveNav();

    app.innerHTML = renderCreateFormHTML();

    setupCreateFormListeners();
};

// -------------------------------------------
// Configurar listeners del formulario de crear
// -------------------------------------------
const setupCreateFormListeners = () => {
    const form = document.querySelector('#create-form');
    const btnCancel = document.querySelector('#btn-cancel');

    btnCancel.addEventListener('click', () => {
        state.currentView = 'home';
        updateActiveNav();
        loadPosts();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.querySelector('#title').value;
        const body = document.querySelector('#body').value;
        const author = document.querySelector('#author').value;
        const tagsInput = document.querySelector('#tags').value;

        const validation = validatePostForm(title, body, author);

        if (!validation.valid) {
            showFormErrors(validation.errors);
            return;
        }

        clearAllErrors();

        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            : ['general'];

        const postData = {
            title: title.trim(),
            body: body.trim(),
            userId: 1,
            tags: tags,
            reactions: { likes: 0, dislikes: 0 }
        };

        try {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando...';

            await createPost(postData);

            showSuccess('¡Publicación creada exitosamente!');

            form.reset();

            setTimeout(() => {
                state.currentView = 'home';
                updateActiveNav();
                loadPosts();
            }, 1000);

        } catch (error) {
            showError('Error al crear la publicación: ' + error.message);

            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Publicación';
        }
    });

    setupFormValidationListeners(form);
};

// -------------------------------------------
// Renderizar formulario de editar post
// -------------------------------------------
const renderEditForm = (post, user) => {
    state.currentView = 'edit';
    updateActiveNav();

    app.innerHTML = renderEditFormHTML(post, user);

    setupEditFormListeners(post.id);
};

// -------------------------------------------
// Configurar listeners del formulario de editar
// -------------------------------------------
const setupEditFormListeners = (postId) => {
    const form = document.querySelector('#edit-form');
    const btnCancel = document.querySelector('#btn-cancel');

    btnCancel.addEventListener('click', () => {
        loadPostDetail(postId);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.querySelector('#title').value;
        const body = document.querySelector('#body').value;
        const tagsInput = document.querySelector('#tags').value;

        const validation = validatePostForm(title, body, 'readonly');

        if (!validation.valid) {
            showFormErrors(validation.errors);
            return;
        }

        clearAllErrors();

        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            : ['general'];

        const postData = {
            title: title.trim(),
            body: body.trim(),
            tags: tags
        };

        try {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            const updatedPost = await updatePost(postId, postData);

            showSuccess('¡Publicación actualizada exitosamente!');

            state.currentPost = { ...state.currentPost, ...updatedPost };

            setTimeout(() => {
                renderPostDetail(state.currentPost, state.currentUser);
            }, 1000);

        } catch (error) {
            showError('Error al actualizar la publicación: ' + error.message);

            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    });

    setupFormValidationListeners(form);
};

// -------------------------------------------
// Configurar validación en tiempo real
// -------------------------------------------
const setupFormValidationListeners = (form) => {
    const inputs = form.querySelectorAll('input:not([readonly]), textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const errorSpan = document.querySelector(`#${input.id}-error`);
            if (errorSpan) {
                errorSpan.textContent = '';
                errorSpan.style.display = 'none';
            }
            input.classList.remove('field-error');
        });
    });
};

// -------------------------------------------
// Renderizar vista de estadísticas
// -------------------------------------------
const renderStats = async () => {
    state.currentView = 'stats';
    updateActiveNav();

    showLoading();

    try {
        const data = await getPosts(100, 0);
        const posts = data.posts;

        const totalPosts = data.total;
        const totalLikes = posts.reduce((sum, post) => sum + post.reactions.likes, 0);
        const totalDislikes = posts.reduce((sum, post) => sum + post.reactions.dislikes, 0);
        const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
        const avgLikes = (totalLikes / posts.length).toFixed(1);
        const avgViews = (totalViews / posts.length).toFixed(0);

        const tagCount = {};
        posts.forEach(post => {
            post.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });

        const topTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topPosts = [...posts]
            .sort((a, b) => b.reactions.likes - a.reactions.likes)
            .slice(0, 5);

        const stats = { totalPosts, totalLikes, totalDislikes, totalViews, avgLikes, avgViews, topTags, topPosts };

        app.innerHTML = renderStatsHTML(stats);

    } catch (error) {
        showError(error.message);
    }
};

// -------------------------------------------
// Función principal para cargar posts
// -------------------------------------------
const loadPosts = async () => {
    try {
        showLoading();

        const skip = state.currentPage * state.postsPerPage;
        const data = await getPosts(state.postsPerPage, skip);

        state.posts = data.posts;
        state.totalPosts = data.total;
        state.currentView = 'home';

        renderPosts(state.posts);

    } catch (error) {
        showError(error.message);
    }
};

// -------------------------------------------
// Cargar tags disponibles
// -------------------------------------------
const loadTags = async () => {
    try {
        state.allTags = await getAllTags();
    } catch (error) {
        state.allTags = [];
    }
};

// -------------------------------------------
// Inicializar la aplicación
// -------------------------------------------
const init = async () => {
    // Configurar rutas
    initRouter({
        home: () => {
            state.currentPage = 0;
            clearFilters();
        },
        create: () => renderCreateForm(),
        stats: () => renderStats()
    });

    await loadTags();
    loadPosts();
};

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);