import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	build: {
		assetsDir: 'assets',
		rollupOptions: {
			output: {
				manualChunks(id) {
					// console.log(id);
				}
			}
		}
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'lodash-es',
			'antd/es/locale/zh_CN',
			'monaco-editor/esm/vs/basic-languages/java/java.contribution',
			'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution',
			'monaco-editor/esm/vs/basic-languages/sql/sql.contribution',
			'monaco-editor/esm/vs/basic-languages/xml/xml.contribution'
		]
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://192.168.10.10:8080',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
});
