import request from "@/utils/request";

/**
 * 服务项管理相关接口
 */

// 分页查询服务项
export const getServiceItemPageApi = (params) => {
  return request({
    url: "/serviceItem/page",
    method: "get",
    params,
  });
};

// 新增服务项
export const addServiceItemApi = (data) => {
  return request({
    url: "/serviceItem",
    method: "post",
    data,
  });
};

// 修改服务项
export const updateServiceItemApi = (data) => {
  return request({
    url: "/serviceItem",
    method: "put",
    data,
  });
};

// 根据ID查询服务项
export const getServiceItemByIdApi = (id) => {
  return request({
    url: `/serviceItem/${id}`,
    method: "get",
  });
};

// 根据ID删除服务项
export const deleteServiceItemApi = (ids) => {
  return request({
    url: "/serviceItem",
    method: "delete",
    params: { ids },
  });
};

// 服务项状态起禁
export const updateServiceItemStatusApi = (status, id) => {
  return request({
    url: `/serviceItem/status/${status}`,
    method: "post",
    params: { id },
  });
};
