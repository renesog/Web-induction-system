
let sidebarOpen = false;
const sidebar = document.getElementById('sidebar');

function openSidebar() {
  if (!sidebarOpen && sidebar) {
    sidebar.classList.add('sidebar-responsive');
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen && sidebar) {
    sidebar.classList.remove('sidebar-responsive');
    sidebarOpen = false;
  }
}

function toggleMenu() {
  const menu = document.getElementById("profileDropdown");
  if (menu) {
    menu.classList.toggle('hidden');
  }
}
window.addEventListener('click', function (e) {
  const btn = document.getElementById('profileBtn');
  const menu = document.getElementById('profileDropdown');
  if (btn && menu) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }
});
if (document.querySelector('#bar-chart')) {
  const barChartOptions = {
    series: [{ data: [10, 8, 6, 4, 2] }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      fontFamily: 'Sarabun, sans-serif'
    },
    colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1'],
    plotOptions: {
      bar: { distributed: true, borderRadius: 4, horizontal: false, columnWidth: '40%' },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ['แองกัส', 'บราห์มัน', 'ชาร์โรเล่ส์', 'ลิมูซิน', 'ซิมเมนทอล'],
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: { title: { text: 'จำนวน (ตัว)' } },
  };

  const barChart = new ApexCharts(document.querySelector('#bar-chart'), barChartOptions);
  barChart.render();
}
if (document.querySelector('#area-chart')) {
  const areaChartOptions = {
    series: [
      { name: 'คำสั่งซื้อ', data: [31, 40, 28, 51, 42, 109, 100] },
      { name: 'คำสั่งขาย', data: [11, 32, 45, 32, 34, 52, 41] },
    ],
    chart: {
      height: 350,
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Sarabun, sans-serif'
    },
    colors: ['#4f35a1', '#246dec'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'] },
    yaxis: [
      { title: { text: 'คำสั่งซื้อ' } },
      { opposite: true, title: { text: 'คำสั่งขาย' } },
    ],
    tooltip: { shared: true, intersect: false },
  };

  const areaChart = new ApexCharts(document.querySelector('#area-chart'), areaChartOptions);
  areaChart.render();
}