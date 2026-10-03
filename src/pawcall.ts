import { parse } from 'csv-parse/sync';
import { DateTime } from 'luxon';

export type AppointmentRow = {
  clinic: string;
  timezone: string;
  appointment_at: string;
  owner_name: string;
  pet_name: string;
  owner_phone?: string;
  reminder_call_required?: string;
  status?: string;
};

export type Reminder = {
  clinic: string;
  timezone: string;
  appointmentTime: string;
  ownerName: string;
  petName: string;
  ownerPhone?: string;
};

export type ReminderGroup = {
  timezone: string;
  date: string;
  clinics: Array<{
    clinic: string;
    reminders: Reminder[];
  }>;
};

const falseValues = new Set(['false', 'no', 'n', '0']);
const canceledStatuses = new Set(['cancelled', 'canceled']);

export function parseAppointments(csv: string): AppointmentRow[] {
  return parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as AppointmentRow[];
}

export function getReminderGroups(rows: AppointmentRow[], nowIso = new Date().toISOString()): ReminderGroup[] {
  const groups = new Map<string, Map<string, Reminder[]>>();
  const dateByZone = new Map<string, string>();

  for (const row of rows) {
    const reminder = toReminder(row, nowIso);
    if (!reminder) continue;

    const clinicGroups = groups.get(reminder.timezone) ?? new Map<string, Reminder[]>();
    const clinicReminders = clinicGroups.get(reminder.clinic) ?? [];
    clinicReminders.push(reminder);
    clinicGroups.set(reminder.clinic, clinicReminders);
    groups.set(reminder.timezone, clinicGroups);
    dateByZone.set(reminder.timezone, tomorrowDateForZone(nowIso, reminder.timezone));
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timezone, clinicGroups]) => ({
      timezone,
      date: dateByZone.get(timezone) ?? tomorrowDateForZone(nowIso, timezone),
      clinics: [...clinicGroups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([clinic, reminders]) => ({
          clinic,
          reminders: reminders.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
        }))
    }));
}

export function formatReminderGroups(groups: ReminderGroup[]): string {
  if (groups.length === 0) return 'No reminder calls due tomorrow.';

  return groups
    .map(group => {
      const clinicLines = group.clinics.flatMap(({ clinic, reminders }) => [
        `  Clinic: ${clinic}`,
        ...reminders.map(reminder => {
          const phone = reminder.ownerPhone ? ` · ${reminder.ownerPhone}` : '';
          return `    - ${reminder.appointmentTime} · ${reminder.ownerName} for ${reminder.petName}${phone}`;
        })
      ]);

      return [`Timezone: ${group.timezone} (${group.date})`, ...clinicLines].join('\n');
    })
    .join('\n\n');
}

function toReminder(row: AppointmentRow, nowIso: string): Reminder | null {
  requireValue(row.clinic, 'clinic');
  requireValue(row.timezone, 'timezone');
  requireValue(row.appointment_at, 'appointment_at');
  requireValue(row.owner_name, 'owner_name');
  requireValue(row.pet_name, 'pet_name');

  if (row.reminder_call_required && falseValues.has(row.reminder_call_required.toLowerCase())) return null;
  if (row.status && canceledStatuses.has(row.status.toLowerCase())) return null;

  const appointment = DateTime.fromISO(row.appointment_at, { zone: row.timezone }).setZone(row.timezone);
  if (!appointment.isValid) {
    throw new Error(`Invalid appointment_at for ${row.owner_name}: ${row.appointment_at}`);
  }

  if (appointment.toISODate() !== tomorrowDateForZone(nowIso, row.timezone)) return null;

  return {
    clinic: row.clinic,
    timezone: row.timezone,
    appointmentTime: appointment.toFormat('HH:mm'),
    ownerName: row.owner_name,
    petName: row.pet_name,
    ownerPhone: row.owner_phone || undefined
  };
}

function tomorrowDateForZone(nowIso: string, timezone: string): string {
  const now = DateTime.fromISO(nowIso, { setZone: true }).setZone(timezone);
  if (!now.isValid) throw new Error(`Invalid current time: ${nowIso}`);

  const tomorrow = now.plus({ days: 1 }).toISODate();
  if (!tomorrow) throw new Error(`Could not calculate tomorrow for timezone: ${timezone}`);
  return tomorrow;
}

function requireValue(value: string | undefined, column: string): void {
  if (!value) throw new Error(`Missing required column value: ${column}`);
}
