<template>
  <div class="category-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="分类名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入分类名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="clearQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="title">分类列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增分类
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="categoryTable" border stripe style="width: 100%">
        <el-table-column prop="name" label="分类名称" align="center" />
        <el-table-column prop="sort" label="排序值" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="220" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="220" align="center" />
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="currentEditId ? '编辑分类' : '新增分类登记'"
      width="500px"
      destroy-on-close
      @closed="onDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
// 导入你修改后的 API
import {
  categoryPageQueryApi,
  categoryAddApi,
  categoryUpdateApi,
  categoryGetByIdApi,
  categoryDeleteApi,
  categoryStatusApi
} from "@/api/serviceCategory";

// 数据定义
const loading = ref(false);
const categoryTable = ref([]);
const total = ref(0);
const dialogVisible = ref(false);
const currentEditId = ref(null);
const formRef = ref(null);

// 查询参数
const queryForm = reactive({ name: "" });
const pageParams = reactive({ page: 1, pageSize: 10 });

// 表单数据
const categoryForm = reactive({
  name: "",
  sort: 0
});

// 校验规则
const rules = {
  name: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
  sort: [{ required: true, message: "排序值不能为空", trigger: "blur" }]
};

// --- 方法逻辑 ---

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await categoryPageQueryApi({ ...pageParams, ...queryForm });
    if (res.code === 1) {
      categoryTable.value = res.data.records;
      total.value = res.data.total;
    }
  } finally {
    loading.value = false;
  }
};

// 搜索与重置
const handleSearch = () => {
  pageParams.page = 1;
  getList();
};

const clearQuery = () => {
  queryForm.name = "";
  handleSearch();
};

// 分页处理
const handleSizeChange = (val) => {
  pageParams.pageSize = val;
  getList();
};

const handleCurrentChange = (val) => {
  pageParams.page = val;
  getList();
};

// 新增与编辑触发
const handleAdd = () => {
  currentEditId.value = null;
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  const res = await categoryGetByIdApi(row.id);
  if (res.code === 1) {
    currentEditId.value = row.id;
    Object.assign(categoryForm, res.data);
    dialogVisible.value = true;
  }
};

// 状态切换 (启用/禁用)
const handleStatusChange = async (row) => {
  try {
    const res = await categoryStatusApi(row.status, row.id);
    if (res.code === 1) {
      ElMessage.success("状态修改成功");
    }
  } catch (error) {
    // 失败时回滚前端状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 删除操作
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除分类 "${row.name}" 吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    const res = await categoryDeleteApi(row.id);
    if (res.code === 1) {
      ElMessage.success("删除成功");
      getList();
    }
  });
};

// 提交表单 (新增或修改)
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const data = { ...categoryForm };
      if (currentEditId.value) data.id = currentEditId.value;

      const res = currentEditId.value 
        ? await categoryUpdateApi(data) 
        : await categoryAddApi(data);

      if (res.code === 1) {
        ElMessage.success(currentEditId.value ? "更新成功" : "添加成功");
        dialogVisible.value = false;
        getList();
      }
    }
  });
};

// 弹窗关闭后的清理
const onDialogClosed = () => {
  if (formRef.value) formRef.value.resetFields();
  currentEditId.value = null;
  Object.assign(categoryForm, { name: "", sort: 0 });
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
/* 深度复刻 emp.vue 的样式逻辑 */
.category-container {
  padding: 0;
  background-color: transparent;
}

.filter-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

.query-form .el-form-item {
  margin-bottom: 0;
  margin-right: 15px;
}

.table-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 确保输入数字框在表单中表现美观 */
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>