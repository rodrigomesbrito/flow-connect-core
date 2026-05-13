# AGENTS.md

## Project Context
Prototype for client validation.
Stack: React + Vite + TypeScript + shadcn/ui + Tailwind CSS
Persistence: localStorage only (no backend, no Supabase)

## Rules
- All data persists in localStorage
- No external API calls
- Components follow the shadcn/ui pattern
- Mobile-first is mandatory
- TypeScript: no `any`, use enums for status and priority

## What NOT to Do
- Do not add Supabase or any backend
- Do not add authentication
- Do not add complex charts to the Dashboard
- Do not rewrite existing components without explicit instruction
- Do not use ERP-style visuals