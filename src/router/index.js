import { createRouter, createWebHistory } from "vue-router";
import LayoutView from "../views/layout/layout.vue";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login/login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      component: LayoutView,
      meta: { requiresAuth: true },
      redirect: "/report",
      children: [
        {
          path: "report",
          name: "report",
          component: () => import("../views/report/report.vue"),
          meta: { title: "数据报表" },
        },
        {
          path: "emp",
          name: "emp",
          component: () => import("../views/emp/emp.vue"),
          meta: { title: "员工管理" },
        },
        {
          path: "mover",
          name: "mover",
          component: () => import("../views/mover/mover.vue"),
          meta: { title: "搬家师傅管理" },
        },
        {
          path: "serviceCategory",
          name: "serviceCategory",
          component: () =>
            import("../views/serviceCategory/serviceCategory.vue"),
          meta: { title: "服务分类" },
        },
        {
          path: "serviceItem",
          name: "serviceItem",
          component: () => import("../views/serviceItem/serviceItem.vue"),
          meta: { title: "服务项目管理" },
        },
        {
          path: "order",
          name: "order",
          component: () => import("../views/order/order.vue"),
          meta: { title: "订单管理" },
        },
        {
          path: "log",
          name: "log",
          component: () => import("../views/log/log.vue"),
          meta: { title: "操作日志" },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/404/404.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.name === "login" && userStore.isLoggedIn) {
    next({ name: "report" });
  } else {
    next();
  }
});

export default router;
