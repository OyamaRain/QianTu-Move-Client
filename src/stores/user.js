import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as loginApi } from "../api/login";
import router from "../router";

export const useUserStore = defineStore("user", () => {
  // 1. 安全地获取初始值，防止 JSON.parse 解析 null 或非法字符串报错
  const getInitialUserInfo = () => {
    try {
      const data = localStorage.getItem("userInfo");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("解析用户信息失败", e);
      return null;
    }
  };

  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref(getInitialUserInfo());
  const isLoggedIn = computed(() => !!token.value);

  // 2. 登录行为
  async function loginAction(username, password) {
    try {
      const res = await loginApi({ username, password });
      // 假设后端返回结构为 { code: 200, data: { token: '...', name: '...' } }
      const { token: newToken, ...userData } = res.data;

      // 统一更新状态
      setToken(newToken);
      setUserInfo(userData);

      return { success: true };
    } catch (error) {
      // 这里的错误消息通常由 axios 拦截器处理过
      return {
        success: false,
        message: error.response?.data?.message || "登录失败",
      };
    }
  }

  // 3. 设置 Token (持久化)
  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }

  // 4. 设置用户信息 (持久化)
  function setUserInfo(data) {
    userInfo.value = data;
    if (data) {
      localStorage.setItem("userInfo", JSON.stringify(data));
    } else {
      localStorage.removeItem("userInfo");
    }
  }

  // 5. 纯粹的清理方法 (供拦截器或退出登录调用)
  function clearUserData() {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  // 6. 退出登录行为
  function logoutAction() {
    clearUserData();
    // 这里的跳转可以保留，但 UI 提示建议放在调用此方法的组件内
    router.push("/login");
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    logoutAction,
    clearUserData,
    setToken,
  };
});
