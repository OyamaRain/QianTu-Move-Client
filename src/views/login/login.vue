<template>
  <div class="login-container">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo-wrapper">
          <img src="@/assets/QT-ICON.png" alt="迁途搬家" class="logo" />
        </div>
        <h1>迁途搬家</h1>
        <p class="subtitle">Efficient & Professional Moving Management</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? "正在认证..." : "即刻进入" }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
// 注意：确保你已经安装了 @element-plus/icons-vue 并在全局注册或局部引入 User, Lock 图标

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginFormRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function handleLogin() {
  if (!loginFormRef.value) return;
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    const result = await userStore.loginAction(loginForm.username, loginForm.password);
    if (result.success) {
      ElMessage.success("登录成功");
      const redirect = route.query.redirect || "/";
      router.push(redirect);
    } else {
      ElMessage.error(result.message || "登录失败");
    }
  } catch (error) {
    // 验证不通过不提示
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 背景容器：使用更现代的径向渐变 */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  background-image: 
    radial-gradient(at 0% 0%, rgba(102, 126, 234, 0.15) 0, transparent 50%),
    radial-gradient(at 50% 0%, rgba(118, 75, 162, 0.15) 0, transparent 50%),
    radial-gradient(at 100% 0%, rgba(102, 126, 234, 0.15) 0, transparent 50%);
  overflow: hidden;
}

/* 动态背景装饰球 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
}
.circle-1 {
  width: 400px;
  height: 400px;
  background: rgba(102, 126, 234, 0.3);
  top: -100px;
  right: -100px;
  animation: move 10s infinite alternate;
}
.circle-2 {
  width: 300px;
  height: 300px;
  background: rgba(118, 75, 162, 0.2);
  bottom: -50px;
  left: -50px;
  animation: move 8s infinite alternate-reverse;
}

@keyframes move {
  from { transform: translate(0, 0); }
  to { transform: translate(50px, 50px); }
}

/* 登录框：毛玻璃效果 */
.login-box {
  position: relative;
  z-index: 10;
  width: 400px;
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Logo 装饰 */
.logo-wrapper {
  display: inline-block;
  padding: 12px;
  margin-bottom: 20px;
}

.logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

/* 表单细节优化 */
:deep(.el-input__wrapper) {
  background-color: #f5f7fa !important;
  box-shadow: none !important;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  border-color: #667eea;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: #fff !important;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

/* 按钮渐变与阴影 */
.login-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 8px 15px rgba(118, 75, 162, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(118, 75, 162, 0.4);
  opacity: 0.9;
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #bfbfbf;
}
</style>