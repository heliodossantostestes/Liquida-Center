import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Dynamically load and register API routes from the /api directory
    const apiDir = path.join(__dirname, 'api');
    try {
        const files = await readdir(apiDir);
        for (const file of files) {
            if (file.endsWith('.ts')) {
                const routeName = file.slice(0, -3);
                const routePath = `/api/${routeName}`;
                const modulePath = `file://${path.join(apiDir, file)}`; // Use file URL for ESM import
                const module = await import(modulePath);
                
                if (module.default && typeof module.default === 'function') {
                    console.log(`Registering API route: ${routePath}`);
                    app.all(routePath, (req, res) => {
                        // The types are compatible enough for this to work with express.json()
                        module.default(req as VercelRequest, res as VercelResponse);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading API routes:', error);
    }

    // Use Vite's connect instance as middleware in development
    // In production, serve built files.
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa'
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(__dirname, 'dist');
        app.use(express.static(distPath));
        // Fallback to index.html for SPA routing
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
}

createServer();
