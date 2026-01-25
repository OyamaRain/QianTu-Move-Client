<template>
  <div class="employee-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="员工姓名">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入员工姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="clear">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="title">员工列表</span>
          <el-button type="primary" @click="dialogFormVisible = true">
            <el-icon><Plus /></el-icon> 新增员工
          </el-button>
        </div>
      </template>

      <el-table :data="employeeTable" border stripe style="width: 100%">
        <el-table-column
          prop="username"
          label="账号"
          width="140"
          align="center"
        />
        <el-table-column prop="name" label="姓名" width="140" align="center" />
        <el-table-column prop="role" label="身份" width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.role === 'ADMIN' ? 'danger' : 'success'"
              effect="light"
            >
              {{ row.role === "ADMIN" ? "管理员" : "普通员工" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="110" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              :disabled="row.id === currentUserId"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="220"
          align="center"
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="220"
          align="center"
        />
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="editEmployee(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogFormVisible"
      :title="currentEditId ? '编辑员工信息' : '新增员工登记'"
      width="600px"
      destroy-on-close
      @closed="clearForm"
    >
      <el-form
        ref="employeeFormRef"
        :model="employeeInfoForm"
        :rules="rules"
        label-width="100px"
        label-position="right"
        status-icon
      >
        <div class="form-grid">
          <div class="form-column">
            <el-form-item label="员工账号" prop="username">
              <el-input
                v-model="employeeInfoForm.username"
                placeholder="请输入登录账号"
              />
            </el-form-item>
            <el-form-item label="员工姓名" prop="name">
              <el-input
                v-model="employeeInfoForm.name"
                placeholder="请输入真实姓名"
              />
            </el-form-item>
            <el-form-item label="员工角色" prop="role">
              <el-select
                v-model="employeeInfoForm.role"
                placeholder="选择岗位角色"
                style="width: 100%"
              >
                <el-option label="系统管理员" value="ADMIN" />
                <el-option label="普通员工" value="STAFF" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-column">
            <el-form-item label="手机号码" prop="phone">
              <el-input
                v-model.trim="employeeInfoForm.phone"
                placeholder="11位手机号"
              />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="employeeInfoForm.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="0">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="上传头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <img
                  v-if="employeeInfoForm.avatar"
                  :src="employeeInfoForm.avatar"
                  class="avatar-preview"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm(employeeFormRef)"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import {
  getEmployeePage,
  updateEmployeeStatus,
  addEmployee,
  getEmployeeById,
  updateEmployee,
} from "@/api/emp";
import { uploadFile } from "../../api/common";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

const employeeTable = ref([]);
const dialogFormVisible = ref(false);

// 获取当前编辑的员工 ID，null 表示新增
const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
const currentUserId = userInfo.id || null; // 如果找不到 ID，也不会报错

// 当前编辑的员工 ID
const currentEditId = ref(null);

const employeeFormRef = ref(null);

// 员工表单数据
const employeeInfoForm = reactive({
  username: "",
  name: "",
  role: null,
  sex: null,
  phone: "",
  avatar: "",
});

// 定义校验规则
const rules = reactive({
  username: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  role: [{ required: true, message: "请选择身份", trigger: "change" }],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的11位手机号",
      trigger: "blur",
    },
  ],
});

// 处理头像预览
const handleAvatarChange = async (file) => {
  // 校验文件格式
  const isJPG = file.raw.type === "image/jpeg" || file.raw.type === "image/png";
  // 校验文件大小：file.raw.size 的单位是字节 (Byte)
  const isLt5M = file.raw.size / 1024 / 1024 < 5;

  if (!isJPG) {
    ElMessage.error("上传头像图片只能是 JPG/PNG 格式!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("上传头像图片大小不能超过 5MB!");
    return false;
  }

  // 构造 FormData 发送请求
  const formData = new FormData();
  formData.append("file", file.raw); // 这里的 'file' 必须对应后端 Controller 的参数名

  try {
    const res = await uploadFile(formData);
    if (res.code === 1) {
      // 上传成功后，将后端返回的 OSS 地址赋值给表单
      employeeInfoForm.avatar = res.data;
      ElMessage.success("头像上传成功");
    } else {
      ElMessage.error("头像上传失败");
    }
  } catch (error) {
    console.error("上传异常", error);
  }
};

// 处理每页显示数量的变化
function handleSizeChange(newSize) {
  pageParams.pageSize = newSize;
  pageParams.page = 1; // 切换每页条数时，回到第一页
  search();
}

// 处理当前页码的变化
function handleCurrentChange(newPage) {
  pageParams.page = newPage;
  search(); //
}

// 查询表单数据 --- EmployeePageQueryDTO
const total = ref(0);
const queryForm = reactive({
  name: "",
});
const pageParams = reactive({
  page: 1,
  pageSize: 10,
});

// 获取员工信息列表
async function search() {
  // 调用接口获取员工信息列表
  const result = await getEmployeePage({ ...pageParams, ...queryForm });
  if (result.code === 1) {
    total.value = result.data.total;
    employeeTable.value = result.data.records;
  } else {
    console.error("获取员工信息失败");
  }
}

// 2. 修改点击“搜索”按钮的逻辑（或者创建一个新函数）
function handleSearch() {
  pageParams.page = 1; // 点击搜索按钮时，从第一页开始看
  search();
}

// 处理员工状态切换
async function handleStatusChange(row) {
  try {
    const result = await updateEmployeeStatus(row.id, row.status);
    if (result.code === 1) {
      ElMessage.success("状态修改成功");
    } else {
      throw new Error("后端保存失败");
    }
  } catch (error) {
    ElMessage.error("状态修改失败");
    // 只有在失败时，才把前端的状态翻转回去
    row.status = row.status === 1 ? 0 : 1;
  }
}

// 提交逻辑修改
async function submitForm(formEl) {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      const submitData = { ...employeeInfoForm };
      // 如果是编辑，手动补上 ID
      if (currentEditId.value) {
        submitData.id = currentEditId.value;
      }

      const result = currentEditId.value
        ? await updateEmployee(submitData)
        : await addEmployee(submitData);

      if (result.code === 1) {
        ElMessage.success(currentEditId.value ? "更新成功" : "添加成功");
        dialogFormVisible.value = false;
        search(); // 刷新列表
      } else {
        ElMessage.error(result.msg || "操作失败");
      }
    }
  });
}

// 编辑员工
// 修改编辑函数：只提取表单需要的 6 个字段
async function editEmployee(row) {
  try {
    const result = await getEmployeeById(row.id);
    if (result.code === 1) {
      currentEditId.value = row.id;
      dialogFormVisible.value = true;

      // 关键修改：解构赋值，只取表单字段
      const { username, name, role, sex, phone, avatar } = result.data;
      Object.assign(employeeInfoForm, {
        username,
        name,
        role,
        sex,
        phone,
        avatar,
      });
    }
  } catch (error) {
    ElMessage.error("查询员工信息失败");
  }
}

// 清空表单
function clearForm() {
  // 先重置校验残余（红字提示）
  if (employeeFormRef.value) {
    employeeFormRef.value.resetFields();
  }

  // 再重置 ID
  currentEditId.value = null;

  // 最后确保对象干净
  Object.assign(employeeInfoForm, {
    username: "",
    name: "",
    role: null,
    sex: null,
    phone: "",
    avatar: "",
  });
}

// 清空查询条件
function clear() {
  queryForm.name = "";
  pageParams.page = 1;
  search();
}
// 页面加载时获取员工信息
onMounted(() => {
  search();
});
</script>

<style scoped>
/* 容器背景色，使卡片悬浮感更强 */
.employee-container {
  padding: 0;
  background-color: transparent;
}

/* 筛选卡片样式 */
.filter-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 移除查询表单的下边距 */
.query-form .el-form-item {
  margin-bottom: 0;
  margin-right: 15px;
}

/* 表格卡片样式 */
.table-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 表格头部布局 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header .title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

/* 对话框内部网格 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* 头像上传美化 */
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  transition: 0.3s;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

/* 分页右对齐 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
