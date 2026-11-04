import { defineConfig } from 'vite';

// GitHub Pages는 저장소 이름이 URL 경로에 포함될 수 있습니다.
// 상대 경로를 사용하면 /username/repository/ 형태와 도메인 루트,
// Capacitor의 로컬 webDir(dist) 환경에서 같은 빌드 결과를 사용할 수 있습니다.
export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
});
