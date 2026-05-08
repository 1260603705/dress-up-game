# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this repository

This is a workspace with the `obra/superpowers` skill suite installed via `npx skills`. The 14 skills live under `.agents/skills/` and are managed through the skills CLI. `skills-lock.json` tracks installed skills and their hashes.

## Available skills

All 14 superpowers skills are installed and active. Key workflows:

- **using-superpowers** — Entry point skill loaded at conversation start; governs how all other skills are discovered and invoked.
- **subagent-driven-development** — Primary development workflow: write a plan, review the spec, dispatch a code-quality reviewer, then implement.
- **writing-plans / executing-plans** — Plan-first development: write implementation plans before writing code, then execute them step by step.
- **test-driven-development** — Write tests before implementation with strict red-green-refactor cycles.
- **requesting-code-review / receiving-code-review** — Code review workflow for both sides of the review process.
- **systematic-debugging** — Structured debugging with root-cause tracing, condition-based waiting, and defense-in-depth.
- **verification-before-completion** — Verify all work before marking tasks complete.
- **dispatching-parallel-agents** — Decompose and dispatch independent work to parallel subagents.
- **finishing-a-development-branch** — Standardized branch cleanup and PR finalization.
- **brainstorming** — Structured brainstorming with spec review and visual companion support.
- **using-git-worktrees** — Git worktree conventions for isolated development.
- **writing-skills** — Guidance for authoring new skills.

## Skill invocation

Skills are invoked with the `Skill` tool in Claude Code. The `using-superpowers` skill enforces that any applicable skill MUST be invoked — it's not optional. User instructions in CLAUDE.md always take precedence over skill instructions when they conflict.
