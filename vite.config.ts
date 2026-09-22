import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		plugins: [react(), tailwindcss(), svgr({ svgrOptions: { icon: true } })],
		// 路径别名
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		// 代理服务
		server: {
			hmr: true,
			proxy: {
				'/api': {
					target: 'http://192.168.10.10:8080',
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				}
			}
		},
		// 构建产物分包
		build: {
			emptyOutDir: false,
			chunkSizeWarningLimit: 2000,
			rollupOptions: {
				output: {
					// 只拆分确定无循环依赖的叶子大库，其余交给 Rollup 默认分包
					manualChunks(id) {
						if (!id.includes('node_modules')) return;

						// echarts + zrender：纯渲染库，仅被懒加载的监控页引用
						if (id.includes('echarts') || id.includes('zrender'))
							return 'echarts';
						// fluent 图标：仅依赖 react，无反向依赖
						if (id.includes('@fluentui/react-icons')) return 'icons';
						// MUI X：单向依赖 @mui/material，不产生跨 chunk 循环
						if (id.includes('@mui/x-data-grid')) return 'data-grid';
						if (id.includes('@mui/x-tree-view')) return 'tree-view';
					}
				}
			}
		}
	};
});
