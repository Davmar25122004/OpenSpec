const ClockEventsRepository = require('../../../packages/openspec-mariadb-adapter/db/ClockEventsRepository');

class ClockingService {
  async registerEntry(userId, { deviceId, locationLat, locationLng }) {
    const lastEvent = await ClockEventsRepository.getLastEventForUser(userId);

    if (lastEvent && lastEvent.event_type === 'ENTRY') {
      const error = new Error('User is already clocked in');
      error.status = 409;
      throw error;
    }

    return await ClockEventsRepository.create({
      user_id: userId,
      event_type: 'ENTRY',
      device_id: deviceId,
      location_lat: locationLat,
      location_lng: locationLng
    });
  }

  async registerExit(userId, { deviceId, locationLat, locationLng }) {
    const lastEvent = await ClockEventsRepository.getLastEventForUser(userId);

    if (!lastEvent || lastEvent.event_type === 'EXIT') {
      const error = new Error('User is not clocked in');
      error.status = 403;
      throw error;
    }

    return await ClockEventsRepository.create({
      user_id: userId,
      event_type: 'EXIT',
      device_id: deviceId,
      location_lat: locationLat,
      location_lng: locationLng
    });
  }

  async getLatestEvents(userId, limit = 5) {
    return await ClockEventsRepository.getLatestEvents(userId, limit);
  }
}

module.exports = new ClockingService();
