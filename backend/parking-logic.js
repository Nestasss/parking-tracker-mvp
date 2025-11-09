// Логика определения парковки
// TODO: Реализовать проверку скорости, времени остановки и геоданных

function isParking(stopData) {
  // stopData = { speed, duration, location }
  // Пока упрощённая логика: скорость < 5 км/ч и остановка > 2 минут
  if (stopData.speed < 5 && stopData.duration > 120) {
    return true;
  }
  return false;
}

module.exports = { isParking };
