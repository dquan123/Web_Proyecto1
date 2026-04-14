//Punto de entrada de la aplicación

import { getPosts, getPostById, getUserById, createPost, updatePost } from './api.js';
import { validatePostForm, showFormErrors, clearAllErrors } from './validation.js';

// Referencia al contenedor principal
const app = document.querySelector('#app');

// -------------------------------------------
// Estado de la aplicación
// -------------------------------------------
let state = {
    posts: [],
    currentPost: null,
    currentUser: null,
    currentView: 'home',
    currentPage: 0,
    postsPerPage: 10,
    totalPosts: 0,
    loading: false,
    error: null
};

// -------------------------------------------
// Función para mostrar estado de carga
// -------------------------------------------
const showLoading = () => {
    app.innerHTML = `
        <div class="loading">
            <p>Cargando...</p>
        </div>
    `;
};

// -------------------------------------------
// Función para mostrar errores
// -------------------------------------------
const showError = (message) => {
    app.innerHTML = `
        <div class="error">
            <p>Error ${message}</p>
            <button onclick="location.reload()">Reintentar</button>
        </div>
    `;
};

// -------------------------------------------
// Función para mostrar mensaje de éxito
// -------------------------------------------
const showSuccess = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

// -------------------------------------------
// Función para renderizar controles de paginación
// -------------------------------------------
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

// -------------------------------------------
// Función para renderizar la lista de posts
// -------------------------------------------
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
    
    setupPaginationListeners();
    setupDetailListeners();
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
    app.innerHTML = `
        <article class="post-detail">
            <button class="btn-back" id="btn-back">← Volver al listado</button>
            
            <h1 class="post-detail-title">${post.title}</h1>
            
            <div class="post-detail-meta">
                <span class="post-author">👤 ${user.firstName} ${user.lastName}</span>
                <span class="post-views">👁️ ${post.views} vistas</span>
            </div>
            
            <div class="post-detail-body">
                <p>${post.body}</p>
            </div>
            
            <div class="post-detail-tags">
                🏷️ Tags: ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
            </div>
            
            <div class="post-detail-reactions">
                <span class="reaction">👍 ${post.reactions.likes} likes</span>
                <span class="reaction">👎 ${post.reactions.dislikes} dislikes</span>
            </div>
            
            <div class="post-detail-actions">
                <button class="btn-edit" data-id="${post.id}">✏️ Editar</button>
                <button class="btn-delete" data-id="${post.id}">🗑️ Eliminar</button>
            </div>
        </article>
    `;
    
    // Listener para volver al listado
    document.querySelector('#btn-back').addEventListener('click', () => {
        state.currentView = 'home';
        updateActiveNav();
        loadPosts();
    });
    
    // Listener para editar
    document.querySelector('.btn-edit').addEventListener('click', () => {
        renderEditForm(post, user);
    });
};

// -------------------------------------------
// Renderizar formulario de crear post
// -------------------------------------------
const renderCreateForm = () => {
    state.currentView = 'create';
    updateActiveNav();
    
    app.innerHTML = `
        <section class="form-container">
            <h2>Crear Nueva Publicación</h2>
            
            <form id="create-form" class="post-form" novalidate>
                <div class="form-group">
                    <label for="title">Título *</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        placeholder="Escribe el título del post (mínimo 5 caracteres)"
                    >
                    <span class="error-message" id="title-error"></span>
                </div>
                
                <div class="form-group">
                    <label for="body">Contenido *</label>
                    <textarea 
                        id="body" 
                        name="body" 
                        rows="6" 
                        placeholder="Escribe el contenido del post (mínimo 20 caracteres)"
                    ></textarea>
                    <span class="error-message" id="body-error"></span>
                </div>
                
                <div class="form-group">
                    <label for="author">Nombre del Autor *</label>
                    <input 
                        type="text" 
                        id="author" 
                        name="author" 
                        placeholder="Tu nombre"
                    >
                    <span class="error-message" id="author-error"></span>
                </div>
                
                <div class="form-group">
                    <label for="tags">Tags (separados por coma)</label>
                    <input 
                        type="text" 
                        id="tags" 
                        name="tags" 
                        placeholder="tecnología, programación, web"
                    >
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" id="btn-cancel">Cancelar</button>
                    <button type="submit" class="btn-submit">Crear Publicación</button>
                </div>
            </form>
        </section>
    `;
    
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
            reactions: {
                likes: 0,
                dislikes: 0
            }
        };
        
        try {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando...';
            
            const newPost = await createPost(postData);
            
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
    
    app.innerHTML = `
        <section class="form-container">
            <h2>Editar Publicación</h2>
            
            <form id="edit-form" class="post-form" novalidate>
                <div class="form-group">
                    <label for="title">Título *</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        value="${post.title}"
                        placeholder="Escribe el título del post (mínimo 5 caracteres)"
                    >
                    <span class="error-message" id="title-error"></span>
                </div>
                
                <div class="form-group">
                    <label for="body">Contenido *</label>
                    <textarea 
                        id="body" 
                        name="body" 
                        rows="6" 
                        placeholder="Escribe el contenido del post (mínimo 20 caracteres)"
                    >${post.body}</textarea>
                    <span class="error-message" id="body-error"></span>
                </div>
                
                <div class="form-group">
                    <label for="author">Nombre del Autor</label>
                    <input 
                        type="text" 
                        id="author" 
                        name="author" 
                        value="${user.firstName} ${user.lastName}"
                        readonly
                        class="field-readonly"
                    >
                    <span class="field-hint">El autor no se puede modificar</span>
                </div>
                
                <div class="form-group">
                    <label for="tags">Tags (separados por coma)</label>
                    <input 
                        type="text" 
                        id="tags" 
                        name="tags" 
                        value="${post.tags.join(', ')}"
                        placeholder="tecnología, programación, web"
                    >
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" id="btn-cancel">Cancelar</button>
                    <button type="submit" class="btn-submit">Guardar Cambios</button>
                </div>
            </form>
        </section>
    `;
    
    setupEditFormListeners(post.id);
};

// -------------------------------------------
// Configurar listeners del formulario de editar
// -------------------------------------------
const setupEditFormListeners = (postId) => {
    const form = document.querySelector('#edit-form');
    const btnCancel = document.querySelector('#btn-cancel');
    
    // Cancelar - volver al detalle
    btnCancel.addEventListener('click', () => {
        loadPostDetail(postId);
    });
    
    // Enviar formulario
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
            tags: tags
        };
        
        try {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
            
            const updatedPost = await updatePost(postId, postData);
            
            showSuccess('¡Publicación actualizada exitosamente!');
            
            // Actualizar el post en el estado con los nuevos datos
            state.currentPost = { ...state.currentPost, ...updatedPost };
            
            // Volver al detalle después de 1 segundo
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
// Configurar validación en tiempo real para formularios
// -------------------------------------------
const setupFormValidationListeners = (form) => {
    const inputs = form.querySelectorAll('input, textarea');
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
// Actualizar navegación activa
// -------------------------------------------
const updateActiveNav = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === state.currentView) {
            link.classList.add('active');
        }
    });
};

// -------------------------------------------
// Configurar navegación
// -------------------------------------------
const setupNavigation = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            
            if (view === 'home') {
                state.currentView = 'home';
                state.currentPage = 0;
                updateActiveNav();
                loadPosts();
            } else if (view === 'create') {
                renderCreateForm();
            }
        });
    });
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
// Inicializar la aplicación
// -------------------------------------------
const init = () => {
    setupNavigation();
    loadPosts();
};

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);