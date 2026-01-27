
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.add('hidden');
    }
  });
}



var barChartOptions = {
  series: [{
    name: 'จำนวน (ตัว)',

    data: [10, 8, 6, 4, 2]
  }],
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    fontFamily: 'Sarabun, sans-serif'

  },
  colors: ["#2962ff", "#d50000", "#2e7d32", "#ff6d00", "#583cb3"],
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      horizontal: false,
      columnWidth: '40%',
    }
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  xaxis: {
    categories: ["แองกัส", "บราห์มัน", "ชาร์โรเล่ส์", "ลิมูซิน", "ซิมเมนทอล"],

    labels: { style: { fontSize: '12px' } }
  },
  yaxis: { title: { text: "จำนวน (ตัว)" } }
};

var barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
barChart.render();




var areaChartOptions = {
  series: [{
    name: 'คำสั่งซื้อ',

    data: [31, 40, 28, 51, 42, 109, 100]
  }, {
    name: 'คำสั่งขาย',

    data: [11, 62, 90, 65, 68, 105, 85]
  }],
  chart: {
    height: 350,
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Sarabun, sans-serif'
  },
  colors: ["#583cb3", "#2962ff"],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค."],

  },
  yaxis: [
    { title: { text: 'คำสั่งซื้อ' } },
    { opposite: true, title: { text: 'คำสั่งขาย' } },
  ],
  tooltip: { shared: true, intersect: false }
};

var areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
areaChart.render();