// ============================================================================
// CRYPTO UTILS - Utilidades de Criptografia
// Arquivo: crypto-utils.js
// Descrição: Funções seguras para hash de senhas usando bcrypt
// Versão: 1.0
// ============================================================================

(function(window) {
    'use strict';

    // Verifica se bcrypt está disponível
    if (typeof dcodeIO === 'undefined' || typeof dcodeIO.bcrypt === 'undefined') {
        console.error('⚠️ bcrypt.js não carregado! Inclua bcrypt.min.js antes de crypto-utils.js');
        return;
    }

    const bcrypt = dcodeIO.bcrypt;

    /**
     * Configurações de segurança
     */
    const SECURITY_CONFIG = {
        saltRounds: 10, // Número de rounds do bcrypt (10 é o padrão recomendado)
        minPasswordLength: 6, // Tamanho mínimo da senha
        maxPasswordLength: 72 // Limite do bcrypt
    };

    /**
     * Gera um hash bcrypt seguro para uma senha
     * @param {string} password - Senha em texto plano
     * @returns {string} Hash bcrypt da senha
     * @throws {Error} Se a senha for inválida
     */
    function hashPassword(password) {
        // Validações
        if (!password || typeof password !== 'string') {
            throw new Error('Senha inválida');
        }

        // Converter para string garantida
        password = String(password).trim();

        if (password.length < SECURITY_CONFIG.minPasswordLength) {
            throw new Error(`Senha deve ter no mínimo ${SECURITY_CONFIG.minPasswordLength} caracteres`);
        }

        if (password.length > SECURITY_CONFIG.maxPasswordLength) {
            throw new Error(`Senha deve ter no máximo ${SECURITY_CONFIG.maxPasswordLength} caracteres`);
        }

        try {
            // Garantir que saltRounds é número
            const saltRounds = Number(SECURITY_CONFIG.saltRounds) || 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);
            console.log('[AUTH] Hash de senha gerado com sucesso');
            return hash;
        } catch (error) {
            console.error('❌ Erro ao gerar hash:', error);
            throw new Error('Falha ao criptografar senha');
        }
    }

    /**
     * Verifica se uma senha corresponde ao hash armazenado
     * @param {string} password - Senha em texto plano
     * @param {string} hash - Hash bcrypt armazenado
     * @returns {boolean} True se a senha corresponder ao hash
     */
    function verifyPassword(password, hash) {
        // Validações
        if (!password || typeof password !== 'string') {
            console.error('❌ Senha inválida para verificação');
            return false;
        }

        if (!hash || typeof hash !== 'string') {
            console.error('❌ Hash inválido para verificação');
            return false;
        }

        // Verifica se é um hash bcrypt válido
        if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
            console.error('❌ Hash não está no formato bcrypt');
            return false;
        }

        try {
            const isValid = bcrypt.compareSync(password, hash);
            if (isValid) {
                console.log('[OK] Senha verificada com sucesso');
            } else {
                console.log('[ERROR] Senha incorreta');
            }
            return isValid;
        } catch (error) {
            console.error('❌ Erro ao verificar senha:', error);
            return false;
        }
    }

    /**
     * Verifica se uma string é um hash bcrypt válido
     * @param {string} str - String para verificar
     * @returns {boolean} True se for um hash bcrypt válido
     */
    function isValidHash(str) {
        if (!str || typeof str !== 'string') {
            return false;
        }

        // Hash bcrypt tem formato: $2a$10$[22 chars salt][31 chars hash]
        const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
        return bcryptRegex.test(str);
    }

    /**
     * Valida força da senha
     * @param {string} password - Senha para validar
     * @returns {object} Objeto com resultado da validação e mensagens
     */
    function validatePasswordStrength(password) {
        const result = {
            isValid: false,
            score: 0,
            messages: []
        };

        if (!password || typeof password !== 'string') {
            result.messages.push('Senha inválida');
            return result;
        }

        // Verifica tamanho mínimo
        if (password.length < SECURITY_CONFIG.minPasswordLength) {
            result.messages.push(`Mínimo ${SECURITY_CONFIG.minPasswordLength} caracteres`);
            return result;
        }

        // Verifica tamanho máximo
        if (password.length > SECURITY_CONFIG.maxPasswordLength) {
            result.messages.push(`Máximo ${SECURITY_CONFIG.maxPasswordLength} caracteres`);
            return result;
        }

        result.isValid = true;
        result.score = 1;

        // Verifica caracteres maiúsculos
        if (/[A-Z]/.test(password)) {
            result.score++;
        } else {
            result.messages.push('Adicione letras maiúsculas');
        }

        // Verifica números
        if (/[0-9]/.test(password)) {
            result.score++;
        } else {
            result.messages.push('Adicione números');
        }

        // Verifica caracteres especiais
        if (/[^A-Za-z0-9]/.test(password)) {
            result.score++;
        } else {
            result.messages.push('Adicione caracteres especiais');
        }

        // Verifica tamanho adequado
        if (password.length >= 12) {
            result.score++;
        }

        // Define mensagem de força
        if (result.score >= 4) {
            result.strength = 'forte';
        } else if (result.score >= 3) {
            result.strength = 'média';
        } else {
            result.strength = 'fraca';
        }

        return result;
    }

    /**
     * Gera uma senha aleatória segura
     * @param {number} length - Tamanho da senha (padrão: 12)
     * @returns {string} Senha aleatória
     */
    function generateSecurePassword(length = 12) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';
        
        // Garante pelo menos um de cada tipo
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));

        // Preenche o resto aleatoriamente
        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Embaralha a senha
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        return password;
    }

    /**
     * Sanitiza entrada do usuário removendo caracteres perigosos
     * @param {string} input - String para sanitizar
     * @returns {string} String sanitizada
     */
    function sanitizeInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }

        // Remove tags HTML e scripts
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    }

    // Expõe as funções globalmente
    window.CryptoUtils = {
        hashPassword,
        verifyPassword,
        isValidHash,
        validatePasswordStrength,
        generateSecurePassword,
        sanitizeInput,
        SECURITY_CONFIG
    };

    console.log('[AUTH] CryptoUtils v1.0 carregado - Sistema de criptografia ativo');

})(window);
