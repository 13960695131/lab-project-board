// 这是整个程序的入口文件。
// 浏览器加载 index.html 时会执行这里。

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// createApp(App) 创建一个 Vue 应用，参数是根组件（App.vue）
// .mount('#app') 把它挂到 index.html 里那个 id="app" 的 div 上
createApp(App).mount('#app')
