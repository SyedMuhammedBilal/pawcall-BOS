#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { formatReminderGroups, getReminderGroups, parseAppointments } from './pawcall.js';

const args = parseArgs(process.argv.slice(2));

if (!args.file || args.help) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

try {
  const csv = readFileSync(args.file, 'utf8');
  const rows = parseAppointments(csv);
  const groups = getReminderGroups(rows, args.now);
  console.log(formatReminderGroups(groups));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`pawcall: ${message}`);
  process.exit(1);
}

function parseArgs(rawArgs: string[]): { file?: string; now?: string; help?: boolean } {
  const parsed: { file?: string; now?: string; help?: boolean } = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === '--help' || arg === '-h') parsed.help = true;
    else if (arg === '--file' || arg === '-f') parsed.file = rawArgs[++index];
    else if (arg === '--now') parsed.now = rawArgs[++index];
    else if (!parsed.file) parsed.file = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function printHelp(): void {
  console.log(`pawcall

Find pet owners who need a reminder call tomorrow, grouped by clinic timezone.

Usage:
  pawcall --file appointments.csv
  pawcall appointments.csv --now 2026-10-03T12:00:00Z

Required CSV columns:
  clinic, timezone, appointment_at, owner_name, pet_name

Optional CSV columns:
  owner_phone, reminder_call_required, status
`);
}
