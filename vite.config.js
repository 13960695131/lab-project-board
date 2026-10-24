import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 的配置文件。现在只需要告诉它：这是一个 Vue 项目。
// plugin-vue 负责把 .vue 文件编译成浏览器能看懂的代码。
export default defineConfig({
  plugins: [vue()],
})
