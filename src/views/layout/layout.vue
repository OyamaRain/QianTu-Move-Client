<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside">
      <div class="logo-area">
        <img src="@/assets/QT-ICON.png" alt="迁途搬家" class="logo" />
        <transition name="el-fade-in-linear">
          <span v-show="!isCollapsed" class="title">迁途搬家管理端</span>
        </transition>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="layout-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/report">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据报表</template>
        </el-menu-item>

        <el-menu-item index="/emp">
          <el-icon><User /></el-icon>
          <template #title>员工管理</template>
        </el-menu-item>

        <el-menu-item index="/mover">
          <el-icon><Van /></el-icon>
          <template #title>搬家师傅</template>
        </el-menu-item>

        <el-menu-item index="/serviceCategory">
          <el-icon><Grid /></el-icon>
          <template #title>服务分类</template>
        </el-menu-item>

        <el-menu-item index="/serviceItem">
          <el-icon><Goods /></el-icon>
          <template #title>服务项目</template>
        </el-menu-item>

        <el-menu-item index="/order">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>

        <el-menu-item index="/log">
          <el-icon><Document /></el-icon>
          <template #title>操作日志</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar || defaultAvatar">
                {{ userInfo?.name?.charAt(0) || "U" }}
              </el-avatar>
              <span class="username">{{
                userInfo?.name || userInfo?.userName || "用户"
              }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog
    v-model="dialogFormVisible"
    title="修改密码"
    width="500"
    @closed="resetForm(ruleFormRef)"
  >
    <el-form
      ref="ruleFormRef"
      :model="passwordForm"
      :rules="rules"
      label-width="100px"
      status-icon
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword(ruleFormRef)"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessageBox, ElMessage } from "element-plus";
import { updateEmployeePassword } from "../../api/emp";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 默认收起菜单
const isCollapsed = ref(true);
const defaultAvatar = "";

const userInfo = computed(() => userStore.userInfo);
const activeMenu = computed(() => route.path);
const currentRoute = route;

// 修改密码逻辑保持不变
const dialogFormVisible = ref(false);
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const ruleFormRef = ref();

const validateConfirmPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

const rules = reactive({
  oldPassword: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: "blur" },
  ],
});

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

async function handleCommand(command) {
  switch (command) {
    case "password":
      dialogFormVisible.value = true;
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await userStore.logoutAction();
      } catch (e) {
        console.error(e);
      }
      break;
  }
}

async function handleUpdatePassword(formEl) {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const updateDto = {
          empId: userStore.userInfo?.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        };
        await updateEmployeePassword(updateDto);
        ElMessage.success("密码修改成功，请重新登录");
        dialogFormVisible.value = false;
        setTimeout(() => {
          userStore.logoutAction();
        }, 1500);
      } catch (e) {
        console.error("提交失败", e);
      }
    }
  });
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  overflow-x: hidden;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 10;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #263445;
  overflow: hidden;
}

.logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin-left: 12px;
  white-space: nowrap;
}

.layout-menu {
  border-right: none;
}

.layout-main {
  flex-direction: column;
}

.layout-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  color: #606266;
  font-size: 14px;
}

.layout-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-x: hidden; /* 防止动画时出现横向滚动条 */
}

/* 路由切换动画 (Fade-Transform) */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.4s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>