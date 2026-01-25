import request from "@/utils/request";

/**
 * 分类管理相关接口
 */

// 分页查询分类
export const categoryPageQueryApi = (params) => {
  return request({
    url: "/category/page",
    method: "get",
    params,
  });
};

// 新增分类
export const categoryAddApi = (data) => {
  return request({
    url: "/category",
    method: "post",
    data,
  });
};

// 修改分类
export const categoryUpdateApi = (data) => {
  return request({
    url: "/category",
    method: "put",
    data,
  });
};

// 根据ID查询分类
export const categoryGetByIdApi = (id) => {
  return request({
    url: `/category/${id}`,
    method: "get",
  });
};

// 根据ID删除分类
export const categoryDeleteApi = (id) => {
  return request({
    url: "/category",
    method: "delete",
    params: { id },
  });
};

// 启用、禁用分类
export const categoryStatusApi = (status, id) => {
  return request({
    url: `/category/status/${status}`,
    method: "post",
    params: { id },
  });
};
