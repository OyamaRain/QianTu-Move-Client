<template>
  <div class="report-container">
    <div class="filter-bar">
      <span class="filter-label">统计时间：</span>
      <el-date-picker
        v-model="rangeDate"
        type="daterange"
        value-format="YYYY-MM-DD HH:mm:ss"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="shortcuts"
        @change="initData"
      />
    </div>

    <el-row :gutter="20" class="summary-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header><span class="card-header-text">订单完成率</span></template>
          <div class="stat-val primary">{{ (summary.orderCompletionRate * 100 || 0).toFixed(2) }}%</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header><span class="card-header-text">订单总数</span></template>
          <div class="stat-val">{{ summary.totalOrderCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header><span class="card-header-text">有效订单数</span></template>
          <div class="stat-val success">{{ summary.validOrderCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">流水金额趋势 (元)</div>
          <v-chart class="chart" :option="turnoverOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">用户量增长趋势</div>
          <v-chart class="chart" :option="userOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="chart-card">
          <div class="chart-title">每日订单数据对比</div>
          <v-chart class="chart-full" :option="orderOption" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getUserStatistics, getTurnoverStatistics, getOrderStatistics } from '../../api/report';

// 注册 ECharts
use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const rangeDate = ref([]);
const summary = reactive({
  totalOrderCount: 0,
  validOrderCount: 0,
  orderCompletionRate: 0
});

const turnoverOption = ref({});
const userOption = ref({});
const orderOption = ref({});

// 快捷日期选项
const shortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); return [start, end] } },
  { text: '最近一月', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 30); return [start, end] } }
];

// VO 字符串解析工具
const splitStr = (str) => (str ? str.split(',') : []);

const initData = async () => {
  const [beginTime, endTime] = rangeDate.value || [];
  const params = { beginTime, endTime };

  try {
    // 1. 流水统计
    const resT = await getTurnoverStatistics(params);
    const tData = resT.data;
    turnoverOption.value = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: splitStr(tData.dateList) },
      yAxis: { type: 'value' },
      series: [{ 
        name: '流水', type: 'line', smooth: true, 
        data: splitStr(tData.turnoverList), 
        itemStyle: { color: '#409EFF' },
        areaStyle: { color: 'rgba(64, 158, 255, 0.1)' } 
      }]
    };

    // 2. 用户统计
    const resU = await getUserStatistics(params);
    const uData = resU.data;
    userOption.value = {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      xAxis: { type: 'category', data: splitStr(uData.dateList) },
      yAxis: { type: 'value' },
      series: [
        { name: '新增用户', type: 'line', data: splitStr(uData.newUserList), smooth: true, itemStyle: { color: '#67C23A' } },
        { name: '总用户数', type: 'line', data: splitStr(uData.totalUserList), smooth: true, itemStyle: { color: '#E6A23C' } }
      ]
    };

    // 3. 订单统计
    const resO = await getOrderStatistics(params);
    const oData = resO.data;
    Object.assign(summary, {
      totalOrderCount: oData.totalOrderCount,
      validOrderCount: oData.validOrderCount,
      orderCompletionRate: oData.orderCompletionRate
    });
    orderOption.value = {
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      xAxis: { type: 'category', data: splitStr(oData.dateList) },
      yAxis: { type: 'value' },
      series: [
        { name: '订单总数', type: 'bar', barWidth: '30%', data: splitStr(oData.orderCountList), itemStyle: { color: '#91cc75' } },
        { name: '有效订单数', type: 'line', data: splitStr(oData.validOrderCountList), itemStyle: { color: '#fac858' }, smooth: true }
      ]
    };
  } catch (e) {
    console.error("数据加载失败:", e);
  }
};

// 格式化日期工具，匹配 YYYY-MM-DD HH:mm:ss
const formatDateTime = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

onMounted(() => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
  // 使用格式化后的字符串初始化，否则 rangeDate 无法匹配 el-date-picker 的格式要求
  rangeDate.value = [formatDateTime(start), formatDateTime(end)];
  initData();
});
</script>

<style scoped>
.report-container { padding: 0px; background: #f0f2f5; min-height: 100vh; }
.filter-bar { margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; display: flex; align-items: center; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.filter-label { font-weight: bold; margin-right: 12px; color: #606266; }
.summary-cards { margin-bottom: 20px; }
.stat-card { border-radius: 8px; border: none; }
.card-header-text { font-weight: bold; color: #303133; }
.stat-val { font-size: 32px; font-weight: bold; text-align: center; padding: 10px 0; color: #303133; }
.stat-val.primary { color: #409EFF; }
.stat-val.success { color: #67C23A; }
/* 1. 强制隐藏图表卡片的溢出内容 */
.chart-card {
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  border: none;
  /* 核心代码：隐藏内部溢出的滚动条 */
  overflow: hidden; 
}
/* 2. 针对 el-card 内部 body 的间距调整 */
/* Element Plus 的 el-card 默认有 20px padding，
   如果图表高度设为 100% 加上 padding 就会撑开滚动条 */
:deep(.el-card__body) {
  padding: 15px; /* 适当减小内边距 */
  height: 100%;
  box-sizing: border-box;
  overflow: hidden; /* 再次确保 body 层级也不显示滚动条 */
}
.chart-title { font-size: 16px; font-weight: bold; margin-bottom: 20px; padding-left: 10px; border-left: 4px solid #409EFF; color: #333; }
.chart { height: 320px; }
/* 3. 确保图表容器高度计算正确 */
.chart-full {
  width: 100%;
  height: 320px; /* 稍微调小一点，给标题留出空间 */
}
</style>