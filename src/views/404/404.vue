<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <p class="error-description">您可能访问了已被删除的页面，或者输入了错误的地址</p>
      <el-button type="primary" @click="handleBack">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function handleBack() {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #909399;
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  color: #606266;
  margin: 24px 0 16px;
}

.error-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}
</style>
