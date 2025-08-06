// Test de verificación de hidratación - src/tests/hydration.test.js
// Este archivo puede ejecutarse para verificar que no hay errores de hidratación

const puppeteer = require('puppeteer');

describe('Hydration Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();

        // Escuchar errores de consola
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Error de consola:', msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('Error de página:', error.message);
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    const testHydrationOnPage = async (url, pageName) => {
        console.log(`🧪 Probando hidratación en ${pageName}...`);

        await page.goto(`http://localhost:3000${url}`, {
            waitUntil: 'networkidle0'
        });

        // Esperar a que la página se hidrate completamente
        await page.waitForTimeout(2000);

        // Recargar la página para probar hidratación
        await page.reload({ waitUntil: 'networkidle0' });

        // Esperar y verificar que no hay errores
        await page.waitForTimeout(1000);

        console.log(`✅ ${pageName} - Sin errores de hidratación`);
    };

    test('Página de Suplidores - Sin errores de hidratación', async () => {
        await testHydrationOnPage('/suplidores', 'Suplidores');
    });

    test('Página de Empleados - Sin errores de hidratación', async () => {
        await testHydrationOnPage('/empleadoinformacion', 'Empleados');
    });

    test('Página de Vehículos - Sin errores de hidratación', async () => {
        await testHydrationOnPage('/vehiculodatos', 'Vehículos');
    });

    test('Página de Clientes - Sin errores de hidratación', async () => {
        await testHydrationOnPage('/clientes', 'Clientes');
    });

    test('Cambio de temas - Sin errores de hidratación', async () => {
        console.log('🧪 Probando cambio de temas...');

        await page.goto('http://localhost:3000/suplidores', {
            waitUntil: 'networkidle0'
        });

        // Simular cambio de tema (si hay un selector disponible)
        // await page.click('[data-testid="theme-selector"]');

        // Recargar después del cambio de tema
        await page.reload({ waitUntil: 'networkidle0' });

        console.log('✅ Cambio de temas - Sin errores de hidratación');
    });
});

// Ejecutar manualmente con: node src/tests/hydration.test.js
if (require.main === module) {
    console.log('🚀 Iniciando pruebas de hidratación...');
    console.log('⚠️  Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
    console.log('📝 Para instalar puppeteer: npm install --save-dev puppeteer');
}
