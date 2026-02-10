
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

// Check if user is logged in (session check)
function checkSession() {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(currentUser);
}

// Get role display name in Thai
function getRoleDisplayName(role) {
  const roleNames = {
    'doctor': 'สัตวแพทย์',
    'owner': 'เจ้าของฟาร์ม',
    'staff': 'พนักงาน'
  };
  return roleNames[role] || role;
}

// Show/Hide role-based navigation
function showRoleBasedNavigation(role) {
  const navCattle = document.getElementById('nav-cattle');
  const navFeeding = document.getElementById('nav-feeding');
  const navGrowth = document.getElementById('nav-growth');
  const navHealth = document.getElementById('nav-health');

  // Define navigation permissions for each role
  const rolePermissions = {
    'admin': {
      cattle: true,
      feeding: true,
      growth: true,
      health: true
    },
    'doctor': {
      cattle: false,
      feeding: false,
      growth: true,
      health: true
    },
    'owner': {
      cattle: true,
      feeding: true,
      growth: true,
      health: true
    },
    'staff': {
      cattle: true,
      feeding: true,
      growth: true,
      health: false
    }
  };

  const permissions = rolePermissions[role] || rolePermissions['staff'];

  // Show/hide based on permissions
  if (navCattle) navCattle.style.display = permissions.cattle ? 'flex' : 'none';
  if (navFeeding) navFeeding.style.display = permissions.feeding ? 'flex' : 'none';
  if (navGrowth) navGrowth.style.display = permissions.growth ? 'flex' : 'none';
  if (navHealth) navHealth.style.display = permissions.health ? 'flex' : 'none';
}

<<<<<<< HEAD
// Show/Hide role-based sections
function showRoleBasedSections(role) {
  const medicalSection = document.getElementById('medicalSection');
  const financialSection = document.getElementById('financialSection');
  const dataEntrySection = document.getElementById('dataEntrySection');

  // Hide all sections first
  if (medicalSection) medicalSection.classList.add('hidden');
  if (financialSection) financialSection.classList.add('hidden');
  if (dataEntrySection) dataEntrySection.classList.add('hidden');

  // Show section based on role
  switch (role) {
    case 'doctor':
      if (medicalSection) medicalSection.classList.remove('hidden');
      break;
    case 'owner':
      if (financialSection) financialSection.classList.remove('hidden');
      break;
    case 'staff':
      if (dataEntrySection) dataEntrySection.classList.remove('hidden');
      break;
  }
}
=======


>>>>>>> main

// Welcome Message Function (using sessionStorage for logged-in user)
function loadWelcomeMessage() {
  const currentUser = checkSession();
  if (!currentUser) return;

  const savedImage = localStorage.getItem('userProfileImage');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const welcomeText = document.getElementById('welcomeText');
  const welcomeProfileImage = document.getElementById('welcomeProfileImage');
  const welcomeDefaultIcon = document.getElementById('welcomeDefaultIcon');

  if (welcomeBanner && welcomeText) {
    // Extract username without role suffix for display
    const usernameWithoutRole = currentUser.username.split('@')[0];
    const roleDisplayName = getRoleDisplayName(currentUser.role);

    welcomeText.textContent = 'ยินดีต้อนรับ ' + usernameWithoutRole + ' (' + roleDisplayName + ')';
    welcomeBanner.classList.remove('hidden');

    // Load profile image if available
    if (savedImage && welcomeProfileImage && welcomeDefaultIcon) {
      welcomeProfileImage.src = savedImage;
      welcomeProfileImage.classList.remove('hidden');
      welcomeDefaultIcon.classList.add('hidden');
    }
  }

<<<<<<< HEAD
  // Show role-based sections and navigation
  showRoleBasedSections(currentUser.role);
=======
  // Show role-based navigation
>>>>>>> main
  showRoleBasedNavigation(currentUser.role);
}

// Logout function
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Load welcome message when page loads
document.addEventListener('DOMContentLoaded', loadWelcomeMessage);

// Chart instances
let barChart = null;
let areaChart = null;

// Define breeds and colors
const breedList = ['แองกัส', 'บราห์มัน', 'ชาร์โรเล่ส์', 'ลิมูซิน', 'ซิมเมนทอล'];
const breedColors = ["#2962ff", "#d50000", "#2e7d32", "#ff6d00", "#583cb3"];

// Initialize charts with default values
function initializeCharts() {
  var barChartOptions = {
    series: [{
      name: 'จำนวน (ตัว)',
      data: [0, 0, 0, 0, 0]
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      fontFamily: 'Sarabun, sans-serif'
    },
    colors: breedColors,
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
      categories: breedList,
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: { title: { text: "จำนวน (ตัว)" } }
  };

  barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
  barChart.render();

  var areaChartOptions = {
    series: [{
      name: 'คำสั่งซื้อ',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }, {
      name: 'คำสั่งขาย',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
      categories: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
    },
    yaxis: [
      { title: { text: 'คำสั่งซื้อ' } },
      { opposite: true, title: { text: 'คำสั่งขาย' } },
    ],
    tooltip: { shared: true, intersect: false }
  };

  areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
  areaChart.render();
}

// Update dashboard with data from API
async function loadDashboardData() {
  try {
    const response = await fetch('/api/dashboard/stats');
    const result = await response.json();

    if (result.success) {
      const data = result.data;

      // Update stat cards
      updateStatCards(data);

      // Update bar chart with breed data
      updateBreedChart(data.breed_stats);

      // Update area chart with monthly transactions
      updateTransactionChart(data.monthly_transactions);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Update stat cards
function updateStatCards(data) {
  // Find and update stat card values
  const statCards = document.querySelectorAll('.grid .bg-white h2');
  if (statCards.length >= 4) {
    statCards[0].textContent = data.male_count || 0;
    statCards[1].textContent = data.female_count || 0;
    statCards[2].textContent = data.total_sell || 0;
    statCards[3].textContent = data.total_buy || 0;
  }
}

// Update bar chart with breed data
function updateBreedChart(breedStats) {
  if (!barChart || !breedStats) return;

  // Map breed stats to the fixed breed order
  const breedCounts = breedList.map(breed => {
    const found = breedStats.find(b => b.breed === breed);
    return found ? found.count : 0;
  });

  barChart.updateSeries([{
    name: 'จำนวน (ตัว)',
    data: breedCounts
  }]);
}

// Update area chart with monthly transaction data
function updateTransactionChart(monthlyData) {
  if (!areaChart || !monthlyData) return;

  areaChart.updateSeries([
    { name: 'คำสั่งซื้อ', data: monthlyData.buy },
    { name: 'คำสั่งขาย', data: monthlyData.sell }
  ]);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  initializeCharts();
  loadDashboardData();
});