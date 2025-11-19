import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		// react(),
		basicSsl(),
	],
	server: {
		https: true,
		host: "localhost",
		port: 5173,
		strictPort: true,
	},
});
