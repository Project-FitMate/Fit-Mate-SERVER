# Copilot Instructions

## Language

- Write all pull request reviews and code review comments in Korean.
- Keep explanations concise and actionable.
- Use English only for code, identifiers, commit prefixes, package names, and official API names.

## Project Context

- This repository is a NestJS server written in TypeScript.
- Use `pnpm` for all package scripts and dependency management. Do not suggest `npm`.
- The API uses the global prefix `api` and URI versioning with default version `v1`.
- The project uses global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`.
- The project uses global `ClassSerializerInterceptor`, so response DTOs should expose client-facing fields explicitly with `@Expose()`.

## Review Priorities

- Prioritize bugs, runtime errors, security risks, missing validation, and API contract mismatches.
- Check request DTOs for validation decorators from `class-validator`.
- Check query DTOs that receive numbers for `@Type(() => Number)`.
- Check response DTOs for `@Expose()` on fields returned to clients.
- Check file handling code for missing directory handling, unsafe paths, invalid filenames, and cleanup behavior.
- Check external AI model requests for timeout/error handling and response shape assumptions.

## Coding Conventions

- Follow the existing module structure and naming style.
- Keep changes scoped to the touched domain.
- Prefer DTO names already used in this codebase:
  - request body DTO: `CreateXxxDto`
  - query DTO: `GetXxxDto`
  - response DTO: `XxxResponseDto`
  - external/internal item DTO: `XxxItemDto`
- Do not introduce broad abstractions unless they clearly reduce duplication or match an existing pattern.
- Avoid unrelated formatting-only changes in review suggestions.

## Domain Notes

- `user` handles image upload and temporary image cleanup.
- `outfit` sends recommendation parameters to the AI model server and returns outfit items.
- `fitting` sends user and outfit images to the AI model server and returns a generated fitting image.
- Device ID authentication uses the `device-id` request header and stores the validated value on the request.
