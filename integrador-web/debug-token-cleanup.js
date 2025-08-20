
function limpiarTokensExpirados() {
    console.log('🧹 Limpiando tokens expirados...');

    const authData = localStorage.getItem('auth');
    if (authData) {
        try {
            const { token } = JSON.parse(authData);
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                if (payload.exp < currentTime) {
                    console.log('❌ Token expirado encontrado, eliminando...');
                    localStorage.removeItem('auth');
                } else {
                    console.log('✅ Token válido, no es necesario limpiar');
                    return;
                }
            }
        } catch (error) {
            console.log('❌ Token malformado, eliminando...');
            localStorage.removeItem('auth');
        }
    }

    localStorage.removeItem('tempToken');
    localStorage.removeItem('tempUser');

    console.log('✅ Limpieza completada. Recarga la página y prueba a iniciar sesión nuevamente.');
}

if (typeof window !== 'undefined') {
    limpiarTokensExpirados();
}

export { limpiarTokensExpirados };
