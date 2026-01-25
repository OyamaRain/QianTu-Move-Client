import request from "@/utils/request";

/**
 * 分页查询系统日志
 * @param {Object} params - 对应 LogPageQueryDTO
 */
export const getLogPageApi = (params) => {
  return request({
    url: "/log/page", // request.js 已经配置了 baseURL: '/admin'
    method: "get",
    params,
  });
};
