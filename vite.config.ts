import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		assetsDir: 'assets',
		rollupOptions: {
			output: {
				manualChunks(id) {
					// console.log(id);
				},
			},
		},
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
			'monaco-editor/esm/vs/basic-languages/xml/xml.contribution',
		],
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://192.168.10.227:8080',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
});
