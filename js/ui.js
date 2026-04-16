//Funciones de manipulación del DOM

// Referencia al contenedor principal
const app = document.querySelector('#app');

// -------------------------------------------
// Mostrar estado de carga
// -------------------------------------------
const showLoading = () => {
    app.innerHTML = `
        <div class="loading">
            <p>Cargando...</p>
        </div>
    `;
};

// -------------------------------------------
// Mostrar errores
// -------------------------------------------
const showError = (message) => {
    app.innerHTML = `
        <div class="error">
            <p>Error, ${message}</p>
            <button onclick="location.reload()">Reintentar</button>
        </div>
    `;
};

// -------------------------------------------
// Mostrar mensaje de éxito (toast)
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
// Renderizar controles de paginación
// -------------------------------------------
const renderPagination = (currentPage, totalPosts, postsPerPage) => {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const currentPageDisplay = currentPage + 1;
    
    const prevDisabled = currentPage === 0;
    const nextDisabled = currentPage >= totalPages - 1;
    
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
// Renderizar barra de filtros
// -------------------------------------------
const renderFilters = (allTags, filters) => {
    const tagsOptions = allTags.map(tag => 
        `<option value="${tag.slug}" ${filters.tag === tag.slug ? 'selected' : ''}>${tag.name}</option>`
    ).join('');
    
    return `
        <div class="filters-container">
            <div class="filter-group">
                <input 
                    type="text" 
                    id="filter-search" 
                    placeholder="Buscar por título o contenido..."
                    value="${filters.search}"
                >
            </div>
            <div class="filter-group">
                <select id="filter-tag">
                    <option value="">Todos los tags</option>
                    ${tagsOptions}
                </select>
            </div>
            <div class="filter-group">
                <input 
                    type="number" 
                    id="filter-user" 
                    placeholder="ID de usuario"
                    value="${filters.userId}"
                    min="1"
                >
            </div>
            <button class="btn-filter" id="btn-apply-filters">Filtrar</button>
            <button class="btn-clear-filters" id="btn-clear-filters">Limpiar</button>
        </div>
    `;
};

// -------------------------------------------
// Renderizar lista de posts
// -------------------------------------------
const renderPostsList = (posts) => {
    if (posts.length === 0) {
        return `
            <div class="empty">
                <p>No se encontraron posts.</p>
            </div>
        `;
    }

    return posts.map(post => `
        <article class="post-card">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-body">${post.body.substring(0, 100)}...</p>
            <div class="post-meta">
                <span class="post-author">Autor ID: #${post.userId}</span>
                <span class="post-tags">Categorías: ${post.tags.join(', ')}</span>
            </div>
            <div class="post-meta">
                <span class="post-reactions">Me gusta: ${post.reactions.likes} | No me gusta: ${post.reactions.dislikes}</span>
            </div>
            <button class="btn-detail" data-id="${post.id}">Ver detalle</button>
        </article>
    `).join('');
};

// -------------------------------------------
// Renderizar vista de detalle
// -------------------------------------------
const renderPostDetailHTML = (post, user) => {
    return `
        <article class="post-detail">
            <button class="btn-back" id="btn-back">← Volver al listado</button>
            
            <h1 class="post-detail-title">${post.title}</h1>
            
            <div class="post-detail-meta">
                <span class="post-author">Autor: ${user.firstName} ${user.lastName}</span>
                <span class="post-views">Vistas: ${post.views}</span>
            </div>
            
            <div class="post-detail-body">
                <p>${post.body}</p>
            </div>
            
            <div class="post-detail-tags">
                Etiquetas: ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(', ')}
            </div>
            
            <div class="post-detail-reactions">
                <span class="reaction">Me gusta: ${post.reactions.likes}</span> | 
                <span class="reaction">No me gusta: ${post.reactions.dislikes}</span>
            </div>
            
            <div class="post-detail-actions">
                <button class="btn-edit" data-id="${post.id}">Editar</button>
                <button class="btn-delete" data-id="${post.id}">Eliminar</button>
            </div>
        </article>
    `;
};

// -------------------------------------------
// Renderizar formulario de crear post
// -------------------------------------------
const renderCreateFormHTML = () => {
    return `
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
};

// -------------------------------------------
// Renderizar formulario de editar post
// -------------------------------------------
const renderEditFormHTML = (post, user) => {
    return `
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
};

// -------------------------------------------
// Renderizar modal de confirmación de eliminar
// -------------------------------------------
const renderDeleteModal = () => {
    return `
        <div class="modal">
            <h3>¿Eliminar publicación?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div class="modal-actions">
                <button class="btn-cancel" id="btn-cancel-delete">Cancelar</button>
                <button class="btn-delete" id="btn-confirm-delete">Eliminar</button>
            </div>
        </div>
    `;
};

// -------------------------------------------
// Renderizar estadísticas
// -------------------------------------------
const renderStatsHTML = (stats) => {
    const { totalPosts, totalLikes, totalDislikes, totalViews, avgLikes, avgViews, topTags, topPosts } = stats;
    
    return `
        <section class="stats-container">
            <h2>Estadísticas del Blog</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-value">${totalPosts}</span>
                    <span class="stat-label">Total de Posts</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totalLikes}</span>
                    <span class="stat-label">Total de Likes</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totalDislikes}</span>
                    <span class="stat-label">Total de Dislikes</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totalViews}</span>
                    <span class="stat-label">Total de Vistas</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${avgLikes}</span>
                    <span class="stat-label">Promedio de Likes</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${avgViews}</span>
                    <span class="stat-label">Promedio de Vistas</span>
                </div>
            </div>
            
            <div class="stats-details">
                <div class="stats-section">
                    <h3>Tags más usados</h3>
                    <ul class="top-list">
                        ${topTags.map(([tag, count], index) => `
                            <li>
                                <span class="rank">#${index + 1}</span>
                                <span class="name">${tag}</span>
                                <span class="count">${count} posts</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="stats-section">
                    <h3>Posts populares</h3>
                    <ul class="top-list">
                        ${topPosts.map((post, index) => `
                            <li>
                                <span class="rank">#${index + 1}</span>
                                <span class="name">${post.title.substring(0, 40)}...</span>
                                <span class="count">Me gusta: ${post.reactions.likes}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </section>
    `;
};

// Exportar funciones
export {
    showLoading,
    showError,
    showSuccess,
    renderPagination,
    renderFilters,
    renderPostsList,
    renderPostDetailHTML,
    renderCreateFormHTML,
    renderEditFormHTML,
    renderDeleteModal,
    renderStatsHTML
};