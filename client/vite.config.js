import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"

export default defineConfig({
	base: "",
	plugins: [
		svelte({
			experimental: {
				useVitePreprocess: true
			}
		})
	],
	server: {
		port: 4000,
		proxy: {
			"/api": {
				target: "http://fa404.user.srcf.net/mealbooking",
				changeOrigin: true,
			}
		}
	}
})