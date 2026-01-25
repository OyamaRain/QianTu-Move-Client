<template>
  <div class="log-management-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="操作人员">
          <el-input
            v-model="queryForm.employeeName"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleTimeChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="title">系统操作日志</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="logTableData" border stripe style="width: 100%">
        <el-table-column prop="employeeName" label="操作人" width="120" align="center" />
        <el-table-column prop="operation" label="操作描述" min-width="30" align="center"/>
        <el-table-column prop="method" label="请求方法" show-overflow-tooltip align="center"/>
        <el-table-column prop="createTime" label="操作时间" width="230" align="center" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// 直接引用你提供的 request.js 路径，假设在 src/utils/request.js
import { getLogPageApi } from '@/api/log'

// --- 响应式数据 ---
const loading = ref(false)
const logTableData = ref([])
const total = ref(0)
const timeRange = ref([])

const queryForm = reactive({
  employeeName: '',
  beginTime: '',
  endTime: ''
})

const pageParams = reactive({
  page: 1,
  pageSize: 10
})

// --- 方法 ---

// 获取数据 (直接在这里写请求逻辑，确保路径与后端 Controller 一致)
const fetchLogs = async () => {
  loading.value = true
  try {
    // 聚合分页参数和查询参数
    const params = {
      ...pageParams,
      ...queryForm
    }
    
    // 调用 log.js 中的接口
    const res = await getLogPageApi(params)
    
    // 你的 request.js 已经处理了 code === 1，这里直接拿 res.data
    if (res && res.data) {
      logTableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    // 错误处理已经在 request.js 的拦截器中通过 ElMessage 实现了
    console.error('加载日志列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTimeChange = (val) => {
  if (val) {
    queryForm.beginTime = val[0]
    queryForm.endTime = val[1]
  } else {
    queryForm.beginTime = ''
    queryForm.endTime = ''
  }
}

const handleSearch = () => {
  pageParams.page = 1
  fetchLogs()
}

const resetQuery = () => {
  queryForm.employeeName = ''
  queryForm.beginTime = ''
  queryForm.endTime = ''
  timeRange.value = []
  handleSearch()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
/* 页面整体容器 */
.log-management-container {
  padding: 0;
  background-color: transparent;
}

/* 1. 顶部筛选卡片修复 */
.filter-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 深度选择器：去除 el-card__body 默认内边距影响，并确保上下边距一致 */
.filter-card :deep(.el-card__body) {
  padding: 20px 20px; 
}

/* 搜索表单 Flex 布局：实现垂直居中 */
.query-form {
  display: flex;
  align-items: center; /* 关键：垂直居中 */
  flex-wrap: wrap;
}

/* 修复：移除 el-form-item 默认的 18px 下边距，这是导致上下不对称的主因 */
.query-form .el-form-item {
  margin-bottom: 0 !important; /* 强制移除下边距 */
  margin-right: 20px;
  display: flex;
  align-items: center;
}

/* 2. 数据列表卡片 */
.table-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

/* 表格头部美化 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header .title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  border-left: 4px solid #409eff; /* 蓝色装饰条 */
  padding-left: 12px;
}

/* 表格行样式优化 */
:deep(.el-table__header-wrapper th) {
  background-color: #f8f9fb !important;
  color: #606266;
  font-weight: bold;
}

.method-code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e67e22;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}

/* 3. 分页对齐 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>