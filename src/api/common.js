import request from "@/utils/request";

// 上传文件
export const uploadFile = (data) => {
  return request({
    url: "/common/upload",
    method: "post",
    data, // axios 会自动识别 FormData 并设置 Content-Type
    headers: { "Content-Type": "multipart/form-data" },
  });
};
