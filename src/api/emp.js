import request from "../utils/request";

// 员工分页查询
export function getEmployeePage(params) {
  return request({
    url: "/employee/page",
    method: "get",
    params,
  });
}

// 修改员工状态
export function updateEmployeeStatus(id, status) {
  return request({
    url: `/employee/status/${status}`,
    method: "post",
    params: {
      id,
    },
  });
}

// 新增员工
export function addEmployee(data) {
  return request({
    url: "/employee",
    method: "post",
    data,
  });
}

//编辑员工
export function updateEmployee(data) {
  return request({
    url: "/employee",
    method: "put",
    data,
  });
}

// 根据ID查询员工
export function getEmployeeById(id) {
  return request({
    url: `/employee/${id}`,
    method: "get",
  });
}

// 修改密码
export function updateEmployeePassword(data) {
  return request({
    url: "/employee/editPassword",
    method: "put",
    data,
  });
}
