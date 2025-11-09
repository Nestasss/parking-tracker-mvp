// Заглушка — в реальности получать с сервера
const parkingHistory = [
  { address: 'ул. Ленина, 15', time: '11:43:12 05.11.2025' },
  { address: 'пр. Мира, 42', time: '14:22:05 04.11.2025' }
];

const container = document.getElementById('parkingHistory');
container.innerHTML = parkingHistory.map(p => `
  <div>
    <p>📍 ${p.address}</p>
    <p>🕐 ${p.time}</p>
  </div>
`).join('');
