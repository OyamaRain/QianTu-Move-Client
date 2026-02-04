import request from "../utils/request";

// 1. 分页查询
export function getMoverPage(params) {
  return request({
    url: "/mover/page",
    method: "get",
    params,
  });
}

// 2. 更改状态 (0-禁用, 1-空闲, 2-忙碌)
export function updateMoverStatus(status, id) {
  return request({
    url: `/mover/status/${status}`,
    method: "post",
    params: { id },
  });
}

// 3. 根据ID查询信息 (用于编辑回显)
export function getMoverById(id) {
  return request({
    url: `/mover/${id}`,
    method: "get",
  });
}

// 4. 编辑信息
export function updateMover(data) {
  return request({
    url: "/mover",
    method: "put",
    data,
  });
}

// 5. 分页查询搬家师傅申请信息
export function getMoverApplyPage(params) {
  return request({
    url: "/mover/apply/page",
    method: "get",
    params,
  });
}

// 6. 通过申请
export function approveMoverApply(id) {
  return request({
    url: `/mover/apply/${id}/approve`,
    method: "post",
  });
}

// 7. 拒绝申请
export function rejectMoverApply(id, rejectionReason) {
  return request({
    url: `/mover/apply/${id}/reject`, // PathVariable 对应路径
    method: "post",
    // 关键点：将理由包装在对象中，Key 必须和后端 DTO 的属性名一致
    data: {
      rejectReason: rejectionReason,
    },
  });
}
