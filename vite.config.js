import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/portfolio/",
    assetsInclude: ['**/*.glb', '**/*.gltf'],
    build: {
        assetsInlineLimit: 0, // Don't inline any assets
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three']
                }
            }
        }
    }
})
