import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            // Match tsconfig "paths": { "@/*": ["./src/*"] }. Route handlers use
            // the alias, so tests importing them need vitest to resolve it too.
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        // Keep the environment the code assumes (server-side/auth code).
        environment: 'node',
    },
});