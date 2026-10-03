import assert from 'node:assert/strict';
import test from 'node:test';
import { formatReminderGroups, getReminderGroups, parseAppointments } from '../dist/pawcall.js';

const csv = `clinic,timezone,appointment_at,owner_name,pet_name,owner_phone,reminder_call_required,status
Happy Paws Vet,America/Los_Angeles,2026-10-04T09:30:00,Alex Chen,Mochi,+1-555-0101,true,confirmed
Happy Paws Vet,America/Los_Angeles,2026-10-05T09:30:00,Jamie Park,Biscuit,+1-555-0102,true,confirmed
Karachi Pet Clinic,Asia/Karachi,2026-10-05T14:00:00,Sara Khan,Leo,+92-300-5550103,true,confirmed
Karachi Pet Clinic,Asia/Karachi,2026-10-05T16:00:00,Omar Ali,Luna,+92-300-5550104,false,confirmed
Karachi Pet Clinic,Asia/Karachi,2026-10-05T17:00:00,Nadia Shah,Milo,+92-300-5550105,true,canceled
`;

test('parses CSV rows', () => {
  assert.equal(parseAppointments(csv).length, 5);
});

test('groups tomorrow reminder calls by each clinic timezone', () => {
  const rows = parseAppointments(csv);
  const groups = getReminderGroups(rows, '2026-10-03T23:30:00Z');

  assert.deepEqual(groups, [
    {
      timezone: 'America/Los_Angeles',
      date: '2026-10-04',
      clinics: [
        {
          clinic: 'Happy Paws Vet',
          reminders: [
            {
              clinic: 'Happy Paws Vet',
              timezone: 'America/Los_Angeles',
              appointmentTime: '09:30',
              ownerName: 'Alex Chen',
              petName: 'Mochi',
              ownerPhone: '+1-555-0101'
            }
          ]
        }
      ]
    },
    {
      timezone: 'Asia/Karachi',
      date: '2026-10-05',
      clinics: [
        {
          clinic: 'Karachi Pet Clinic',
          reminders: [
            {
              clinic: 'Karachi Pet Clinic',
              timezone: 'Asia/Karachi',
              appointmentTime: '14:00',
              ownerName: 'Sara Khan',
              petName: 'Leo',
              ownerPhone: '+92-300-5550103'
            }
          ]
        }
      ]
    }
  ]);
});

test('formats reminder calls for CLI output', () => {
  const rows = parseAppointments(csv);
  const output = formatReminderGroups(getReminderGroups(rows, '2026-10-03T23:30:00Z'));

  assert.match(output, /Timezone: America\/Los_Angeles \(2026-10-04\)/);
  assert.match(output, /    - 09:30 · Alex Chen for Mochi · \+1-555-0101/);
  assert.match(output, /Timezone: Asia\/Karachi \(2026-10-05\)/);
  assert.doesNotMatch(output, /Omar Ali/);
  assert.doesNotMatch(output, /Nadia Shah/);
});

test('prints a quiet message when no calls are due', () => {
  assert.equal(formatReminderGroups([]), 'No reminder calls due tomorrow.');
});
