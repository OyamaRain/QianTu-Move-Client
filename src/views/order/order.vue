<template>
  <div class="order-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryForm" class="query-form-container">
        <div class="form-left-group">
          <el-form-item label="订单号">
            <el-input v-model="queryForm.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          
          <el-form-item label="方式">
            <el-select v-model="queryForm.moveType" placeholder="全部" clearable style="width: 100px">
              <el-option label="同城" :value="1" />
              <el-option label="跨城" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 100px">
              <el-option label="待支付" :value="0" />
              <el-option label="已支付" :value="1" />
              <el-option label="待接单" :value="2" />
              <el-option label="已接单" :value="3" />
              <el-option label="已完成" :value="4" />
              <el-option label="已取消" :value="5" />
            </el-select>
          </el-form-item>

          <el-form-item label="下单时间">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 340px"
              @change="handleDateChange"
            />
          </el-form-item>
        </div>

        <div class="form-right-btns">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetQuery">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="title">订单列表</span>
        </div>
      </template>

      <el-table :data="orderTable" border stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="120" align="center" fixed />
        
        <el-table-column prop="moveType" label="搬家方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.moveType === 1 ? 'primary' : 'warning'">
              {{ row.moveType === 1 ? '同城' : '跨城' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">￥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="appointmentTime" label="预约时间" width="230" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="230" align="center" />
        
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button 
              v-if="[1, 2].includes(row.status)" 
              type="primary" link @click="openAssignDialog(row)"
            >指派</el-button>
            <el-button 
              v-if="row.status === 3" 
              type="success" link @click="handleComplete(row)"
            >完成</el-button>
            <el-button 
              v-if="row.status < 4" 
              type="danger" link @click="handleCancel(row)"
            >取消</el-button>
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

    <el-dialog v-model="assignVisible" title="指派推荐师傅" width="460px" @closed="assignForm.moverId = null">
      <el-form :model="assignForm" label-width="90px">
        <el-form-item label="推荐师傅" prop="moverId">
          <el-select v-model="assignForm.moverId" placeholder="请选择系统推荐的优质师傅" style="width: 100%" filterable>
            <el-option
              v-for="item in recommendMovers"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="mover-option-content">
                <span class="mover-name">{{ item.name }}</span>
                <div class="mover-stats">
                  <span class="rating">★ {{ item.rating || '5.0' }}</span>
                  <span class="order-count">已接 {{ item.orderCount || 0 }} 单</span>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确认指派</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="订单详情" width="650px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单用户ID">{{ currentOrder.userId }}</el-descriptions-item>
        
        <el-descriptions-item label="起点地址" :span="2">
          <div class="address-text">
            <el-icon><LocationFilled style="color: #67C23A"/></el-icon>
            <span style="margin-left: 8px; font-weight: 500;">{{ currentOrder.startAddressName || '暂无数据' }}</span>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="终点地址" :span="2">
          <div class="address-text">
            <el-icon><LocationFilled style="color: #F56C6C"/></el-icon>
            <span style="margin-left: 8px; font-weight: 500;">{{ currentOrder.endAddressName || '暂无数据' }}</span>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="搬家方式">
          <el-tag size="small" :type="currentOrder.moveType === 1 ? 'primary' : 'warning'">
            {{ currentOrder.moveType === 1 ? '同城' : '跨城' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span style="color: #f56c6c; font-weight: bold;">￥{{ currentOrder.totalAmount }}</span>
        </el-descriptions-item>
        
        <el-descriptions-item label="预约时间">{{ currentOrder.appointmentTime }}</el-descriptions-item>
        
        <el-descriptions-item label="承运师傅">
          <el-tag v-if="currentOrder.moverName" type="success" size="small">
            {{ currentOrder.moverName }}
          </el-tag>
          <span v-else style="color: #999">暂无师傅接单</span>
        </el-descriptions-item>
        
        <el-descriptions-item label="订单状态" :span="2">
          <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusLabel(currentOrder.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
// ... Script 部分保持不变，逻辑完全兼容 ...
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, LocationFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getOrderPage, 
  getOrderById, 
  assignOrder, 
  completeOrder, 
  cancelOrder, 
  getRecommendMovers 
} from '@/api/order'

const orderTable = ref([])
const total = ref(0)
const dateRange = ref([])
const detailVisible = ref(false)
const assignVisible = ref(false)
const currentOrder = ref({})
const recommendMovers = ref([]) 

const queryForm = reactive({
  orderNo: '',
  moveType: null,
  status: null,
  beginTime: '',
  endTime: ''
})

const pageParams = reactive({
  page: 1,
  pageSize: 10
})

const assignForm = reactive({
  id: null,
  moverId: null
})

const search = async () => {
  try {
    const res = await getOrderPage({ ...pageParams, ...queryForm })
    if (res.code === 1) {
      orderTable.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取订单列表失败', error)
  }
}

const handleSearch = () => { pageParams.page = 1; search() }

const resetQuery = () => {
  Object.assign(queryForm, { orderNo: '', moveType: null, status: null, beginTime: '', endTime: '' })
  dateRange.value = []; handleSearch()
}

const handleDateChange = (val) => {
  if (val) { queryForm.beginTime = val[0]; queryForm.endTime = val[1] }
  else { queryForm.beginTime = ''; queryForm.endTime = '' }
}

const handleSizeChange = (size) => { pageParams.pageSize = size; search() }
const handleCurrentChange = (page) => { pageParams.page = page; search() }

const getStatusLabel = (s) => {
  const labels = ['待支付', '已支付', '待接单', '已接单', '已完成', '已取消']
  return labels[s] || '未知'
}

const getStatusType = (s) => {
  const types = ['info', 'primary', 'warning', 'success', 'success', 'danger']
  return types[s] || 'info'
}

const viewDetail = async (row) => {
  try {
    const res = await getOrderById(row.id)
    if (res.code === 1) { 
      currentOrder.value = res.data
      detailVisible.value = true 
    }
  } catch (error) {
    console.error('查询详情失败', error)
  }
}

const openAssignDialog = async (row) => {
  assignForm.id = row.id
  assignVisible.value = true
  recommendMovers.value = []
  try {
    const res = await getRecommendMovers(row.id)
    if (res.code === 1) {
      recommendMovers.value = res.data
    }
  } catch (error) {
    console.error('推荐师傅加载失败', error)
  }
}

const submitAssign = async () => {
  if (!assignForm.moverId) return ElMessage.warning('请选择师傅')
  try {
    const res = await assignOrder({
      id: assignForm.id,
      moverId: assignForm.moverId
    })
    if (res.code === 1) {
      ElMessage.success('指派成功')
      assignVisible.value = false
      search() 
    }
  } catch (error) {}
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确认该订单已服务完成吗？', '提示', { type: 'warning' }).then(async () => {
    const res = await completeOrder(row.id)
    if (res.code === 1) { ElMessage.success('订单已完成'); search() }
  })
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '警告', { type: 'error' }).then(async () => {
    const res = await cancelOrder(row.id)
    if (res.code === 1) { ElMessage.success('订单已取消'); search() }
  })
}

onMounted(() => { search() })
</script>

<style scoped>
/* Style 部分保持不变 */
.order-container { padding: 0; }
.filter-card { border: none; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important; }
.query-form-container { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }
.form-left-group { display: flex; flex-wrap: wrap; flex: 1; }
.form-right-btns { display: flex; justify-content: flex-end; min-width: 180px; }
:deep(.el-form-item) { margin-bottom: 0px !important; margin-right: 16px !important; }
.table-card { border: none; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important; }
.address-text { display: flex; align-items: center; word-break: break-all; line-height: 1.4; padding: 4px 0; }
.table-header { display: flex; justify-content: space-between; align-items: center; }
.table-header .title { font-weight: 600; color: #303133; font-size: 16px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
:deep(.el-descriptions__label) { width: 100px; background-color: #f5f7fa !important; font-weight: bold; }

.mover-option-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.mover-stats { display: flex; gap: 12px; font-size: 12px; }
.rating { color: #ff9900; font-weight: bold; }
.order-count { color: #909399; }
</style>