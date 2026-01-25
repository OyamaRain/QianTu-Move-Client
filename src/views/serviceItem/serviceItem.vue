<template>
  <div class="service-item-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="服务名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入服务名称"
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
          <span class="title">服务项列表</span>
          <div class="button-group">
            <el-button 
              type="danger" 
              plain 
              :disabled="!selectedIds.length" 
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon> 批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增服务项
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="tableData" 
        border 
        stripe 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column prop="name" label="服务名称" align="center" />
        
        <el-table-column label="所属分类" align="center">
          <template #default="{ row }">
            <span>{{ getCategoryName(row.categoryId) }}</span>
          </template>
        </el-table-column> 
        
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">￥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="unit" label="单位" width="100" align="center" />
        
        <el-table-column prop="status" label="状态" width="120" align="center">
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
        
        <el-table-column prop="updateTime" label="更新时间" width="200" align="center" />
        
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
          :page-sizes="[10, 20, 50, 100]"
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
      :title="currentEditId ? '编辑服务项' : '新增服务项'"
      width="500px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务项名称" />
        </el-form-item>
        
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="item in categoryOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="服务价格" prop="price">
          <el-input-number 
            v-model="form.price" 
            :precision="2" 
            :step="0.1" 
            :min="0" 
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="服务单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如：次、小时、平方" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { 
  getServiceItemPageApi, 
  addServiceItemApi, 
  updateServiceItemApi, 
  getServiceItemByIdApi, 
  deleteServiceItemApi,
  updateServiceItemStatusApi
} from '@/api/serviceItem'
import { categoryPageQueryApi } from '@/api/serviceCategory'

// --- 变量定义 ---
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const currentEditId = ref(null)
const formRef = ref(null)
const categoryOptions = ref([]) 
const selectedIds = ref([]) // 存储多选的ID

const queryForm = reactive({ name: '' })
const pageParams = reactive({ page: 1, pageSize: 10 })
const form = reactive({ name: '', categoryId: null, price: 0, unit: '' })

const rules = {
  name: [{ required: true, message: '服务名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

// --- 逻辑方法 ---

// 获取分类下拉列表
const getCategoryList = async () => {
  const res = await categoryPageQueryApi({ page: 1, pageSize: 100, status: 1 })
  if (res.code === 1) {
    categoryOptions.value = res.data.records
  }
}

// 分类名称映射
const getCategoryName = (categoryId) => {
  const category = categoryOptions.value.find(item => item.id === categoryId);
  return category ? category.name : '未分类';
};

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getServiceItemPageApi({ ...pageParams, ...queryForm })
    if (res.code === 1) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 多选改变回调
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(`确定批量删除选中的 ${selectedIds.value.length} 个服务项吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    // 转换为逗号分隔字符串以匹配后端接收
    const idsStr = selectedIds.value.join(',')
    const res = await deleteServiceItemApi(idsStr)
    if (res.code === 1) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      getList()
    }
  })
}

// 单个删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除服务项 "${row.name}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await deleteServiceItemApi(row.id)
    if (res.code === 1) {
      ElMessage.success('删除成功')
      getList()
    }
  })
}

// 其余常规逻辑
const handleSearch = () => { pageParams.page = 1; getList() }
const clear = () => { queryForm.name = ''; handleSearch() }
const handleSizeChange = (val) => { pageParams.pageSize = val; getList() }
const handleCurrentChange = (val) => { pageParams.page = val; getList() }
const handleAdd = () => { currentEditId.value = null; dialogVisible.value = true }

const handleEdit = async (row) => {
  const res = await getServiceItemByIdApi(row.id)
  if (res.code === 1) {
    currentEditId.value = row.id
    Object.assign(form, res.data)
    dialogVisible.value = true
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const api = currentEditId.value ? updateServiceItemApi : addServiceItemApi
      const data = { ...form }
      if (currentEditId.value) data.id = currentEditId.value
      const res = await api(data)
      if (res.code === 1) {
        ElMessage.success(currentEditId.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        getList()
      }
    }
  })
}

const handleStatusChange = async (row) => {
  try {
    const res = await updateServiceItemStatusApi(row.status, row.id)
    if (res.code === 1) ElMessage.success('状态更新成功')
  } catch (error) { row.status = row.status === 1 ? 0 : 1 }
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  Object.assign(form, { name: '', categoryId: null, price: 0, unit: '' })
}

onMounted(async () => {
  await getCategoryList() // 先拿分类，再拿列表确保映射成功
  getList()
})
</script>

<style scoped>
.service-item-container { padding: 0; background-color: transparent; }
.filter-card { border: none; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important; }
.query-form .el-form-item { margin-bottom: 0; margin-right: 15px; }
.table-card { border: none; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important; }
.table-header { display: flex; justify-content: space-between; align-items: center; }
.button-group { display: flex; gap: 10px; }
.table-header .title { font-weight: 600; color: #303133; font-size: 16px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>