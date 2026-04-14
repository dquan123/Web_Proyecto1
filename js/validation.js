// Validaciones de formularios

// Validar título (mínimo 5 caracteres)
const validateTitle = (title) => {
    if (!title || title.trim() === '') {
        return { valid: false, message: 'El título es obligatorio' };
    }
    if (title.trim().length < 5) {
        return { valid: false, message: 'El título debe tener al menos 5 caracteres' };
    }
    return { valid: true, message: '' };
};

// Validar contenido (mínimo 20 caracteres)
const validateBody = (body) => {
    if (!body || body.trim() === '') {
        return { valid: false, message: 'El contenido es obligatorio' };
    }
    if (body.trim().length < 20) {
        return { valid: false, message: 'El contenido debe tener al menos 20 caracteres' };
    }
    return { valid: true, message: '' };
};

// Validar autor (no vacío)
const validateAuthor = (author) => {
    if (!author || author.trim() === '') {
        return { valid: false, message: 'El nombre del autor es obligatorio' };
    }
    if (author.trim().length < 2) {
        return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }
    return { valid: true, message: '' };
};

// Validar formulario completo
const validatePostForm = (title, body, author) => {
    const errors = {};
    
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
        errors.title = titleValidation.message;
    }
    
    const bodyValidation = validateBody(body);
    if (!bodyValidation.valid) {
        errors.body = bodyValidation.message;
    }
    
    const authorValidation = validateAuthor(author);
    if (!authorValidation.valid) {
        errors.author = authorValidation.message;
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors: errors
    };
};

// Mostrar errores en el formulario
const showFieldError = (fieldId, message) => {
    const field = document.querySelector(`#${fieldId}`);
    const errorSpan = document.querySelector(`#${fieldId}-error`);
    
    if (field) {
        field.classList.add('field-error');
    }
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
};

// Limpiar error de un campo
const clearFieldError = (fieldId) => {
    const field = document.querySelector(`#${fieldId}`);
    const errorSpan = document.querySelector(`#${fieldId}-error`);
    
    if (field) {
        field.classList.remove('field-error');
    }
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
    }
};

// Limpiar todos los errores
const clearAllErrors = () => {
    clearFieldError('title');
    clearFieldError('body');
    clearFieldError('author');
};

// Mostrar múltiples errores
const showFormErrors = (errors) => {
    clearAllErrors();
    
    if (errors.title) {
        showFieldError('title', errors.title);
    }
    if (errors.body) {
        showFieldError('body', errors.body);
    }
    if (errors.author) {
        showFieldError('author', errors.author);
    }
};

// Exportar funciones
export {
    validateTitle,
    validateBody,
    validateAuthor,
    validatePostForm,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    showFormErrors
};