document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.search-form');
  const input = document.querySelector('.form__input');
  const list = document.querySelector('.prayer-times-list');
  const countryName = document.querySelector('.times__location');
  const timesDate = document.querySelector('.times__date');
  const countriesTimer = document.querySelector('.location__timer');
  const selectOption = document.querySelector('#date-format');
  const tableBody = document.querySelector('.table-body');
  const table = document.querySelector('.prayer-times-table');
  const titleTop = document.querySelector('.table-title');

  table.style.display = 'none';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const region = capitalizeFirstLetter(input.value.trim());
    const option = selectOption.value;
    if (region && option) {
      fetchData(region, option);
    }
    input.value = '';
  });

  async function fetchData(region, option) {
    let apiUrl;
    switch (option) {
      case 'day':
        apiUrl = `https://islomapi.uz/api/present/day?region=${region}`;
        break;
      case 'week':
        apiUrl = `https://islomapi.uz/api/present/week?region=${region}`;
        break;
      case 'monthly':
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        apiUrl = `https://islomapi.uz/api/monthly?region=${region}&month=${month}`;
        break;
      default:
        throw new Error('Invalid option');
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
      const data = await response.json();

      if (option === 'day') {
        updateDailyView(data);
      } else if (option === 'week') {
        updateTableView(data, 'Haftalik');
      } else if (option === 'monthly') {
        updateTableView(data, 'Oylik');
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  function updateDailyView(data) {
    countryName.textContent = `«${data.region}»`;
    list.style.display = 'flex';
    table.style.display = 'none';
    titleTop.textContent = '';
    renderList(data.times, list);
  }

  function updateTableView(data, title) {
    titleTop.textContent = title;
    list.style.display = 'none';
    table.style.display = 'table';
    countryName.textContent = `«${data[0].region}»`;
    renderTable(data, tableBody);
  }

  function renderList(times, node) {
    const dayNames = {
      tong_saharlik: 'Bomdod ',
      quyosh: 'Quyosh ',
      peshin: 'Peshin ',
      asr: 'Asr ',
      shom_iftor: 'Shom ',
      hufton: 'Hufton ',
    };

    node.innerHTML = Object.entries(times)
      .map(([key, time]) => `
              <li class="prayer-times-item">
                  <p class="prayer-times-item__day">${dayNames[key] || key}</p>
                  <time class="prayer-times-item__time">${time}</time>
              </li>
          `)
      .join('');
  }

  function renderTable(data, node) {
    node.innerHTML = data.map((element, index) => `
          <tr>
              <td>${index + 1}</td>
              <td>${element.weekday}</td>
              <td>${element.date}</td>
              <td>${element.times.tong_saharlik}</td>
              <td>${element.times.quyosh}</td>
              <td>${element.times.peshin}</td>
              <td>${element.times.asr}</td>
              <td>${element.times.shom_iftor}</td>
              <td>${element.times.hufton}</td>
          </tr>
      `).join('');
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function convertDate() {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const weeks = [
      'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
      'Payshanba', 'Juma', 'Shanba'
    ];

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = months[currentDate.getMonth()];
    const date = currentDate.getDate();
    const day = weeks[currentDate.getDay()];

    return `${year} yil ${date}-${month}, ${day}`;
  }

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours());
    const minutes = String(now.getMinutes());
    const seconds = String(now.getSeconds());
    countriesTimer.textContent = `${hours}:${minutes}:${seconds}`;
  }

  setInterval(updateClock, 1000);

  fetchData('Toshkent', 'day');
  timesDate.textContent = convertDate();
  updateClock();
});
