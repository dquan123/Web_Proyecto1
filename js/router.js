//Lógica de navegación entre vistas

// -------------------------------------------
// Estado de navegación
// -------------------------------------------
let currentView = 'home';
let navigationCallbacks = {};

// -------------------------------------------
// Registrar callbacks de navegación
// -------------------------------------------
const registerRoutes = (routes) => {
    navigationCallbacks = routes;
};

// -------------------------------------------
// Navegar a una vista
// -------------------------------------------
const navigateTo = (view, params = {}) => {
    currentView = view;
    updateActiveNav();
    
    if (navigationCallbacks[view]) {
        navigationCallbacks[view](params);
    }
};

// -------------------------------------------
// Obtener vista actual
// -------------------------------------------
const getCurrentView = () => {
    return currentView;
};

// -------------------------------------------
// Actualizar navegación activa en el DOM
// -------------------------------------------
const updateActiveNav = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === currentView) {
            link.classList.add('active');
        }
    });
};

// -------------------------------------------
// Configurar listeners de navegación
// -------------------------------------------
const setupNavigation = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            navigateTo(view);
        });
    });
};

// -------------------------------------------
// Inicializar router
// -------------------------------------------
const initRouter = (routes) => {
    registerRoutes(routes);
    setupNavigation();
};

// Exportar funciones
export {
    initRouter,
    navigateTo,
    getCurrentView,
    updateActiveNav
};