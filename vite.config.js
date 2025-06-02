import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';

export default defineConfig({
	base: "./",
	server: {
		https: {
			cert: fs.readFileSync('./localhost+3.pem'),
			key: fs.readFileSync('./localhost+3-key.pem'),
		},
		host: '0.0.0.0',
	},
	resolve: {
		alias: {
			// MindAR が使う特殊パスを three/examples/jsm に紐付け
			'three/addons': resolve(__dirname, 'node_modules/three/examples/jsm'),
		},
	},
});