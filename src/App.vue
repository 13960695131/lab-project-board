<script setup>
import { ref, reactive, computed, watch } from 'vue'

// localStorage 里存放数据的“键名”（相当于给这块数据起个名字）
const STORAGE_KEY = 'lab-projects'

// 首次打开、且本地还没有数据时用的默认示例
const defaultProjects = [
  {
    name: '智能温室监控系统',
    intro: '基于传感器和树莓派，实时监测温室内温湿度并自动调控。',
    members: ['张三', '李四'],
    tech: ['Python', '树莓派', 'MQTT'],
    status: '进行中',
    github: 'https://github.com/example/greenhouse',
  },
  {
    name: '校园二手交易平台',
    intro: '为校内学生提供安全便捷的二手物品发布与交易功能。',
    members: ['王五', '赵六', '钱七'],
    tech: ['Vue', 'Node.js', 'MySQL'],
    status: '已完成',
    github: 'https://github.com/example/campus-market',
  },
  {
    name: '实验室设备预约系统',
    intro: '统一管理实验室仪器设备的借用与归还，避免时间冲突。',
    members: ['孙八'],
    tech: ['React', 'Express', 'MongoDB'],
    status: '暂停',
    github: 'https://github.com/example/lab-booking',
  },
]

// 打开页面时：先从 localStorage 读取已保存的项目；
// 如果没有（或解析失败），就退回默认示例数据。
function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    // 读不到或格式不对就忽略，下方返回默认数据
  }
  return defaultProjects
}

// 把当前项目写回 localStorage（localStorage 只能存字符串，所以用 JSON 转一下）
function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
}

// 用“读出来的数据”（或默认数据）初始化列表
const projects = ref(loadProjects())

// 监听 projects：只要新增 / 删除导致它变化，就自动保存
// deep: true 让它连数组内部的变化（push / splice）也能捕捉到
watch(projects, saveProjects, { deep: true })

// 状态 -> 对应 CSS 类名（用来给状态小标签上不同颜色）。
// 用英文名做类名，避免中文类名在样式里出问题。
const statusClassMap = {
  '进行中': 'status-doing',
  '已完成': 'status-done',
  '暂停': 'status-paused',
}

// ---------- 搜索相关 ----------
// 搜索框内容（v-model 双向绑定到输入框）
const searchText = ref('')

// computed：根据搜索框实时算出要显示的项目列表
// 输入为空 -> 返回全部；否则只保留“名称包含关键字”的项目
const filteredProjects = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return projects.value
  return projects.value.filter((p) => p.name.toLowerCase().includes(keyword))
})

// ---------- 新增项目相关 ----------

// 控制“新增项目”表单是否显示
const showForm = ref(false)

// 表单数据：用 reactive 把一组字段包成一个响应式对象
// 成员 / 技术栈在表单里先用“逗号分隔的字符串”填写，提交时再拆成数组
const form = reactive({
  name: '',
  intro: '',
  members: '',
  tech: '',
  status: '进行中',
  github: '',
})

// 打开表单
function openForm() {
  showForm.value = true
}

// 关闭表单并清空内容
function closeForm() {
  showForm.value = false
  resetForm()
}

// 把表单字段恢复成空
function resetForm() {
  form.name = ''
  form.intro = ''
  form.members = ''
  form.tech = ''
  form.status = '进行中'
  form.github = ''
}

// 提交：把表单数据整理成一个项目对象，加进列表
function submitForm() {
  // 简单校验：项目名称不能为空
  if (!form.name.trim()) return

  // 把“逗号 / 顿号 / 空格分隔”的字符串拆成数组
  const members = form.members.split(/[、,，\s]+/).filter(Boolean)
  const tech = form.tech.split(/[、,，\s]+/).filter(Boolean)

  // push 到 projects 数组，页面会自动多一张卡片
  projects.value.push({
    name: form.name.trim(),
    intro: form.intro.trim(),
    members,
    tech,
    status: form.status,
    github: form.github.trim(),
  })

  closeForm()
}

// 删除项目：先确认，再移除
// 注意：列表现在显示的是 filteredProjects（过滤后的），
// 所以 index 是“过滤后列表里的位置”，要先找回它在原数组里的真实位置
function removeProject(index) {
  const target = filteredProjects.value[index]
  const name = target.name
  // window.confirm 是浏览器自带的确认弹窗，用户点“确定”时返回 true
  const ok = window.confirm(`确定要删除「${name}」吗？此操作不可恢复。`)
  if (ok) {
    const realIndex = projects.value.indexOf(target)
    if (realIndex != -1) projects.value.splice(realIndex, 1)
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>实验室项目展示板</h1>
        <!-- 显示的是“当前可见”的项目数量（搜索后会变化） -->
        <p class="subtitle">共 {{ filteredProjects.length }} 个项目</p>
      </div>
      <!-- 点击打开新增表单 -->
      <button class="add-btn" @click="openForm">+ 新增项目</button>
    </header>

    <!-- 搜索框：输入即时过滤列表 -->
    <div class="search-bar">
      <input
        v-model="searchText"
        type="text"
        class="search-input"
        placeholder="按项目名称搜索，例如：巡检"
      />
    </div>

    <!-- 新增项目表单：showForm 为 true 时才显示 -->
    <form v-if="showForm" class="form" @submit.prevent="submitForm">
      <h3 class="form-title">新增项目</h3>

      <label class="field">
        <span>项目名称 *</span>
        <input v-model="form.name" type="text" placeholder="例如：智能温室监控系统" />
      </label>

      <label class="field">
        <span>项目简介</span>
        <textarea v-model="form.intro" rows="2" placeholder="简单描述这个项目"></textarea>
      </label>

      <label class="field">
        <span>成员（用逗号分隔）</span>
        <input v-model="form.members" type="text" placeholder="例如：张三、李四" />
      </label>

      <label class="field">
        <span>技术栈（用逗号分隔）</span>
        <input v-model="form.tech" type="text" placeholder="例如：Vue、Vite" />
      </label>

      <label class="field">
        <span>项目状态</span>
        <select v-model="form.status">
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="暂停">暂停</option>
        </select>
      </label>

      <label class="field">
        <span>GitHub 地址</span>
        <input v-model="form.github" type="text" placeholder="https://github.com/..." />
      </label>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="closeForm">取消</button>
        <button type="submit" class="btn-submit">提交</button>
      </div>
    </form>

    <!-- v-for 会遍历 projects 数组，为每个项目生成一张卡片 -->
    <div class="grid">
      <article v-for="(project, index) in filteredProjects" :key="project.name" class="card">
        <div class="card-top">
          <h2 class="card-title">{{ project.name }}</h2>
          <div class="card-actions">
            <!-- :class 根据状态动态添加颜色类名 -->
            <span class="badge" :class="statusClassMap[project.status]">
              {{ project.status }}
            </span>
            <!-- 删除按钮：调用 removeProject，传入当前卡片的索引 -->
            <button class="delete-btn" @click="removeProject(index)">删除</button>
          </div>
        </div>

        <p class="card-intro">{{ project.intro }}</p>

        <div class="meta">
          <div class="meta-row">
            <span class="meta-label">成员</span>
            <!-- members 是数组，用 join('、') 拼成一个字符串 -->
            <span>{{ project.members.join('、') }}</span>
          </div>

          <div class="meta-row">
            <span class="meta-label">技术栈</span>
            <span class="tags">
              <!-- 技术栈也是数组，再套一层 v-for 显示成小标签 -->
              <span v-for="t in project.tech" :key="t" class="tag">{{ t }}</span>
            </span>
          </div>
        </div>

        <!-- GitHub 链接，target="_blank" 表示在新标签页打开 -->
        <a class="github-link" :href="project.github" target="_blank" rel="noopener">
          GitHub 仓库 ↗
        </a>
      </article>
    </div>

    <!-- 搜索无结果时的提示 -->
    <p v-if="filteredProjects.length === 0" class="empty">没有找到匹配的项目</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
}
.subtitle {
  color: #8a9099;
  margin-top: 6px;
}

/* 新增项目按钮 */
.add-btn {
  background: #3a7afe;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
}
.add-btn:hover {
  background: #2f6ae0;
}

/* 搜索框 */
.search-bar {
  margin-bottom: 24px;
}
.search-input {
  width: 100%;
  border: 1px solid #d9dee5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
}
.search-input:focus {
  outline: none;
  border-color: #3a7afe;
}
.empty {
  text-align: center;
  color: #8a9099;
  padding: 40px 0;
}

/* 新增表单面板 */
.form {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-title {
  font-size: 18px;
  font-weight: 600;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
.field > span {
  color: #4e5969;
}
.field input,
.field textarea,
.field select {
  border: 1px solid #d9dee5;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
}
.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: none;
  border-color: #3a7afe;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-cancel {
  background: #fff;
  color: #4e5969;
  border: 1px solid #d9dee5;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}
.btn-submit {
  background: #3a7afe;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}
.btn-submit:hover {
  background: #2f6ae0;
}

/* 卡片网格：屏幕宽就多列，窄就自动少列 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.delete-btn {
  background: #fff;
  color: #e5484d;
  border: 1px solid #f3c2c4;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
}
.delete-btn:hover {
  background: #e5484d;
  color: #fff;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
}
.card-intro {
  color: #4e5969;
  font-size: 14px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}
.meta-row {
  display: flex;
  gap: 10px;
}
.meta-label {
  color: #8a9099;
  flex-shrink: 0;
  width: 48px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  background: #eef2f7;
  color: #3a7afe;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
}

/* 状态小标签的基础样式 + 三种状态的颜色 */
.badge {
  flex-shrink: 0;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
}
.status-doing {
  background: #e6f4ea;
  color: #1a7f37;
}
.status-done {
  background: #e8eefc;
  color: #3a7afe;
}
.status-paused {
  background: #f0f1f3;
  color: #6b7280;
}

.github-link {
  margin-top: auto; /* 把链接顶到卡片底部，多张卡片高度不一致时也整齐 */
  color: #3a7afe;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.github-link:hover {
  text-decoration: underline;
}
</style>
