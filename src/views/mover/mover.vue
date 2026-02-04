<template>
  <div class="mover-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="师傅姓名">
          <el-input v-model="queryForm.name" placeholder="请输入姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="禁用" :value="0" />
            <el-option label="空闲" :value="1" />
            <el-option label="忙碌" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon>
              <Search />
            </el-icon> 查询</el-button>
          <el-button @click="resetQuery"><el-icon>
              <Refresh />
            </el-icon> 重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
       <div class="table-header">
          <span class="title">搬家师傅管理</span>
          <el-badge :value="applyTotal" :max="99" :hidden="applyTotal === 0" class="apply-badge">
            <el-button type="warning" plain @click="openApplyDialog">
              <el-icon>
                <List />
              </el-icon> 申请列表
            </el-button>
          </el-badge>
        </div>
      </template>

      <el-dialog v-model="applyDialogVisible" title="师傅入驻申请列表" width="800px" destroy-on-close>
        <div v-loading="applyLoading">
          <div v-if="applyList.length > 0">
            <el-card v-for="item in applyList" :key="item.id" class="apply-item-card" shadow="hover">
              <div class="apply-card-content">
                <div class="apply-info">
                  <el-avatar :size="50" :src="item.avatar" ><el-icon><User /></el-icon></el-avatar>
                  <div class="info-text">
                    <div class="name">{{ item.name }} <span class="phone">{{ item.phone }}</span></div>
                    <div class="time">申请时间：{{ item.createTime }}</div>
                  </div>
                </div>
                <div class="apply-actions">
                  <el-button type="success" size="small" @click="handleApprove(item.userId)">通过</el-button>
                  <el-button type="danger" size="small" @click="handleReject(item.userId)">拒绝</el-button>
                </div>
              </div>
            </el-card>

            <div class="apply-pagination">
              <el-pagination small layout="prev, pager, next" :total="applyTotal"
                v-model:current-page="applyPageParams.page" @current-change="loadApplyList" />
            </div>
          </div>
          <el-empty v-else description="暂无申请数据" />
        </div>
      </el-dialog>

      <el-table :data="moverList" border stripe v-loading="loading">
        <el-table-column label="姓名" align="center" width="120" prop="name" />
        <el-table-column prop="phone" label="手机号" align="center" width="130" />

        <el-table-column label="服务评分" align="center" width="180">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>

        <el-table-column prop="orderCount" label="完成订单数" align="center" width="140" />

        <el-table-column label="当前状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="账号状态" align="center" width="120">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0"
              :before-change="() => handleBeforeStatusChange(row)" :disabled="row.status === 2" />
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="加入时间" align="center" min-width="100" />

        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSearch" @current-change="handleSearch" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑师傅信息" width="600px" destroy-on-close class="mover-dialog">
      <el-form ref="moverFormRef" :model="moverForm" :rules="rules" label-width="100px" label-position="right">
        <div class="dialog-grid">
          <div class="form-left">
            <el-form-item label="师傅姓名" prop="name">
              <el-input v-model="moverForm.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="moverForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="服务评分" prop="rating">
              <el-input-number v-model="moverForm.rating" :precision="1" :step="0.1" :max="5" :min="0"
                style="width: 100%" />
            </el-form-item>
            <el-form-item label="完成订单" prop="orderCount">
              <el-input-number v-model="moverForm.orderCount" :min="0" style="width: 100%" />
            </el-form-item>
          </div>

          <div class="form-right">
            <el-form-item label="师傅头像" prop="avatar">
              <el-upload class="avatar-uploader" action="/admin/common/upload" :headers="{ token: token }"
                :show-file-list="false" :on-success="handleAvatarSuccess">
                <img v-if="moverForm.avatar" :src="moverForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="upload-tip">推荐尺寸: 200x200</div>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">保存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
// 1. 必须引入 Plus 图标
import { Search, Refresh, Plus, List } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMoverPage, updateMoverStatus, getMoverById, updateMover, getMoverApplyPage, approveMoverApply, rejectMoverApply } from '../../api/mover';

const statusMap = {
  0: { label: '禁用', type: 'info' },
  1: { label: '空闲', type: 'success' },
  2: { label: '忙碌', type: 'warning' }
};

// 获取 Token 用于上传
const token = localStorage.getItem('token');

const loading = ref(false);
const moverList = ref([]);
const total = ref(0);

const dialogVisible = ref(false);
const submitLoading = ref(false);
const moverFormRef = ref(null);

const queryForm = reactive({ name: '', phone: '', status: null });
const pageParams = reactive({ page: 1, pageSize: 10 });

const moverForm = reactive({
  id: null,
  name: '',
  phone: '',
  avatar: '',
  rating: 0,
  orderCount: 0
});

const rules = {
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '格式不正确', trigger: 'blur' }
  ]
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await getMoverPage({
      name: queryForm.name,
      phone: queryForm.phone,
      status: queryForm.status,
      page: pageParams.page,
      pageSize: pageParams.pageSize
    });
    // 逻辑检查：确保 res.data 存在
    if (res.code === 1) {
      moverList.value = res.data.records;
      total.value = res.data.total;
    }
    updateApplyCount();
  } finally {
    loading.value = false;
  }
};

const updateApplyCount = async () => {
  try {
    const res = await getMoverApplyPage({ page: 1, pageSize: 1 }); // 只需要获取 total
    if (res.code === 1 || res.code === 0) {
      applyTotal.value = res.data.total;
    }
  } catch (err) {
    console.error("更新申请角标失败");
  }
};

const handleBeforeStatusChange = (row) => {
  if (row.status === 2) {
    ElMessage.warning('忙碌中的师傅不可禁用');
    return false;
  }
  const targetStatus = row.status === 1 ? 0 : 1;
  const text = targetStatus === 1 ? '启用' : '禁用';

  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(`确定要${text}该师傅账号吗？`, '提示', {
      type: 'warning',
    })
      .then(async () => {
        try {
          // 注意参数顺序：status, id (根据你api文件的定义)
          await updateMoverStatus(targetStatus, row.id);
          ElMessage.success(`${text}成功`);
          resolve(true);
        } catch (err) {
          reject(false);
        }
      })
      .catch(() => reject(false));
  });
};

const resetQuery = () => {
  queryForm.name = '';
  queryForm.phone = '';
  queryForm.status = null;
  pageParams.page = 1;
  handleSearch();
};

const handleEdit = async (row) => {
  try {
    const res = await getMoverById(row.id);
    if (res.code === 1) {
      // 这里的 Object.assign 会覆盖旧数据，达到重置效果
      Object.assign(moverForm, res.data);
      dialogVisible.value = true;
    }
  } catch (error) {
    ElMessage.error('获取详情失败');
  }
};

const handleAvatarSuccess = (res) => {
  if (res.code === 1) {
    moverForm.avatar = res.data;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error(res.msg || '上传失败');
  }
};

const submitForm = () => {
  if (!moverFormRef.value) return;
  moverFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        await updateMover(moverForm);
        ElMessage.success('师傅信息已更新');
        dialogVisible.value = false;
        handleSearch();
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// --- 申请列表逻辑 ---
const applyDialogVisible = ref(false);
const applyLoading = ref(false);
const applyList = ref([]);
const applyTotal = ref(0);
const applyPageParams = reactive({ page: 1, pageSize: 5 });

const openApplyDialog = () => {
  applyDialogVisible.value = true;
  loadApplyList();
};

const loadApplyList = async () => {
  applyLoading.value = true;
  try {
    const res = await getMoverApplyPage(applyPageParams);
    if (res.code === 1) {
      applyList.value = res.data.records;
      applyTotal.value = res.data.total;
    }
  } finally {
    applyLoading.value = false;
  }
};

const handleApprove = (id) => {
  ElMessageBox.confirm('确定通过该师傅的入驻申请吗？', '提示', { type: 'success' }).then(async () => {
    await approveMoverApply(id);
    ElMessage.success('已通过申请');
    loadApplyList();
    handleSearch(); // 刷新主列表
  });
};

const handleReject = (id) => {
  ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '理由不能为空'
  }).then(async ({ value }) => {
    await rejectMoverApply(id, value);
    ElMessage.info('已拒绝该申请');
    loadApplyList();
  });
};

onMounted(handleSearch);
</script>

<style scoped>
/* 页面基础容器 */
.mover-container {
  padding: 0px;
}

/* --- 顶部筛选卡片专用样式 --- */
.filter-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 关键修复：增加 .filter-card 前缀，确保不影响底部的 table-card */
.filter-card :deep(.el-card__body) {
  padding: 20px 20px !important;
  display: flex;
  /* 开启 Flex 让表单项水平排列 */
  align-items: center;
  /* 垂直居中 */
  justify-content: flex-start;
}

.query-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.query-form .el-form-item {
  margin-bottom: 0 !important;
  /* 取消下边距实现居中 */
  margin-right: 30px;
  /* 项目间距 */
}

/* --- 底部表格卡片专用样式 --- */
.table-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 确保表格卡片的 body 正常排列，不被 flex 干扰 */
.table-card :deep(.el-card__body) {
  padding: 20px !important;
  display: block;
  /* 恢复块级布局，让分页器独占一行 */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

/* --- 分页器：强制靠右 --- */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  /* 靠右对齐 */
  width: 100%;
}

/* --- 弹窗与上传样式 (保持不变) --- */
.dialog-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  padding: 10px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 120px;
  height: 120px;
  /* 移除之前的 flex，改用 text-align 居中内部内容 */
  text-align: center;
  line-height: 120px;
  background-color: #fafafa;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* --- 申请列表卡片样式 --- */
.apply-item-card {
  margin-bottom: 12px;
  border-radius: 8px;
}

.apply-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.apply-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-text .name {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
}

.info-text .phone {
  font-weight: normal;
  color: #666;
  font-size: 13px;
  margin-left: 8px;
}

.info-text .time {
  font-size: 12px;
  color: #999;
}

.apply-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

/* --- 角标样式微调 --- */
.apply-badge {
  margin-right: 10px; /* 给右侧留点空间 */
}

/* 调整角标在按钮上的偏移位置（可选） */
.apply-badge :deep(.el-badge__content.is-fixed) {
  top: 5px;
  right: 10px;
}
</style>