# pawcall review checklist

Scout’s delegated checklist blocked, so this checklist captures the review criteria used before launch.

## CLI correctness

- `pawcall --file appointments.csv` reads a CSV and prints grouped reminders.
- Positional file argument works: `pawcall appointments.csv`.
- `--now` makes date-sensitive behavior testable.
- Missing required values fail with clear errors.
- Empty result prints a quiet, non-error message.

## Timezone and date edge cases

- Tomorrow is calculated per row timezone, not the machine timezone.
- Appointment times without offsets are interpreted in the clinic timezone.
- Output groups by IANA timezone and shows the target local date.
- Tests cover different tomorrow dates for `America/Los_Angeles` and `Asia/Karachi` from one `now` value.

## CSV handling

- Required columns are documented: `clinic`, `timezone`, `appointment_at`, `owner_name`, `pet_name`.
- Optional skip fields are supported: `reminder_call_required`, `status`.
- `false`, `no`, `n`, and `0` skip reminder calls.
- `canceled` and `cancelled` appointments are skipped.
- Follow-up issue opened for real-world CSV column mapping.

## Tests

- Node’s built-in test runner is used to avoid extra vulnerable test tooling.
- Tests cover parsing, timezone grouping, formatting, skip behavior, and no-result output.
- Local command verified: `npm run check`.

## README and CI

- README includes install, usage, CSV schema, example input, example output, and development commands.
- GitHub Actions runs `npm ci` and `npm run check` on push and pull request.
- Latest GitHub Actions run is green.
- `npm audit` reports 0 vulnerabilities.

## Known follow-ups

- Validate against real clinic appointment exports.
- Add configurable CSV column mapping.
- Decide npm publishing path.
