import request from "../utils/request";

/**
 * 用户统计
 */
export function getUserStatistics(params) {
  return request({
    url: "/report/userStatistics", // 修正：去掉开头的 /admin
    method: "get",
    params,
  });
}

/**
 * 流水统计
 */
export function getTurnoverStatistics(params) {
  return request({
    url: "/report/turnoverStatistics", // 修正：去掉开头的 /admin
    method: "get",
    params,
  });
}

/**
 * 订单统计
 */
export function getOrderStatistics(params) {
  return request({
    url: "/report/ordersStatistics", // 修正：去掉开头的 /admin
    method: "get",
    params,
  });
}
