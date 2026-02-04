import request from "@/utils/request";

/**
 * 订单分页查询
 * @param {Object} params - { orderNo, moveType, status, beginTime, endTime, page, pageSize }
 */
export function getOrderPage(params) {
  return request({
    url: "/orders/page",
    method: "GET",
    params,
  });
}

/**
 * 根据ID查询订单详情
 * @param {Long} id
 */
export function getOrderById(id) {
  return request({
    url: `/orders/details/${id}`,
    method: "GET",
  });
}

/**
 * 指派订单
 * 接口：/admin/orders/{id}/dispatch
 * 注意：id 是路径参数，moverId 根据文档是表单/Query参数
 */
export function assignOrder(data) {
  return request({
    url: `/orders/${data.id}/dispatch/${data.moverId}`,
    method: "POST",
  });
}

/**
 * 完成订单
 * 接口：/admin/orders/{id}/complete
 */
export function completeOrder(id) {
  return request({
    url: `/orders/${id}/complete`,
    method: "POST",
  });
}

/**
 * 取消订单
 * 接口：/admin/orders/{id}/cancel
 */
export function cancelOrder(id) {
  return request({
    url: `/orders/${id}/cancel`,
    method: "POST",
  });
}

/**
 * 根据订单ID查询推荐的搬家师傅
 * 接口地址: /admin/orders/recommend
 * @param {Long} orderId
 */
export function getRecommendMovers(orderId) {
  return request({
    url: "/orders/recommend",
    method: "GET",
    params: {
      orderId: orderId,
    },
  });
}
