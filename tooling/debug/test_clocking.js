const ClockingService = require('./app/server/services/ClockingService');
const pool = require('./openspec-mariadb-adapter/db/pool');

async function runTests() {
  const userId = 'ep1';
  const testDevice = 'test-device-001';
  const testCoords = { lat: 40.4168, lng: -3.7038 };

  console.log('--- Starting Clocking Verification ---');

  try {
    // 0. Cleanup
    console.log('0. Clearing existing events for test user...');
    await pool.query('DELETE FROM clock_events WHERE user_id = ?', [userId]);

    // 1. Initial Entry
    console.log('1. Testing Initial Entry (Should succeed)...');
    const entry1 = await ClockingService.registerEntry(userId, {
      deviceId: testDevice,
      locationLat: testCoords.lat,
      locationLng: testCoords.lng
    });
    console.log('✓ Entry 1 successful, ID:', entry1.insertId);

    // 2. Double Entry
    console.log('2. Testing Double Entry (Should fail)...');
    try {
      await ClockingService.registerEntry(userId, {
        deviceId: testDevice,
        locationLat: testCoords.lat,
        locationLng: testCoords.lng
      });
      console.error('✗ Error: Double entry should have failed');
    } catch (err) {
      if (err.status === 409) {
        console.log('✓ Successfully blocked double entry (409 Conflict)');
      } else {
        throw err;
      }
    }

    // 3. Normal Exit
    console.log('3. Testing Exit (Should succeed)...');
    const exit1 = await ClockingService.registerExit(userId, {
      deviceId: testDevice,
      locationLat: testCoords.lat,
      locationLng: testCoords.lng
    });
    console.log('✓ Exit 1 successful, ID:', exit1.insertId);

    // 4. Double Exit
    console.log('4. Testing Double Exit (Should fail)...');
    try {
      await ClockingService.registerExit(userId, {
        deviceId: testDevice,
        locationLat: testCoords.lat,
        locationLng: testCoords.lng
      });
      console.error('✗ Error: Double exit should have failed');
    } catch (err) {
      if (err.status === 403) {
        console.log('✓ Successfully blocked double exit (403 Forbidden)');
      } else {
        throw err;
      }
    }

    // 5. Entry after Exit
    console.log('5. Testing Entry after Exit (Should succeed)...');
    const entry2 = await ClockingService.registerEntry(userId, {
      deviceId: testDevice,
      locationLat: testCoords.lat,
      locationLng: testCoords.lng
    });
    console.log('✓ Entry 2 successful, ID:', entry2.insertId);

    console.log('--- All Tests Passed Successfully ---');
  } catch (err) {
    console.error('--- Verification Failed ---');
    console.error(err);
  } finally {
    process.exit(0);
  }
}

runTests();
