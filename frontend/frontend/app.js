const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('startTracking');

let watchId;

startBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusDiv.textContent = 'Геолокация не поддерживается.';
    return;
  }

  statusDiv.textContent = 'Слежение запущено...';

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, timestamp } = position.coords;
      statusDiv.textContent = `Позиция обновлена: ${new Date(timestamp).toLocaleTimeString()}`;

      // Отправляем данные на сервер
      fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          userId: 1 // Заглушка — в реальности брать из сессии
        })
      }).catch(err => console.error('Ошибка отправки:', err));
    },
    (error) => {
      console.error('Ошибка геолокации:', error);
      statusDiv.textContent = 'Ошибка получения местоположения.';
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );
});
