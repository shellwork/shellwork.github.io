---
title: "AutoBioLab: Multi-Agent LLM System for Automated Biology Labs"
summary: An LLM agent framework that takes a scientist's intent all the way to executed experiments on liquid-handling robots, with checks before a run and automatic recovery when something goes wrong.
start: 2025-10
role: Researcher (co-first author)
lab: Carnegie Mellon University · Prof. Min Xu & Prof. Rebecca E. Taylor
tags: [LLM Agents, Laboratory Automation, Liquid Handling]
featured: true
order: 1
cover: ../figures/autobiolab.png
contributions:
  - Designed a multi-agent framework covering experiment planning, protocol verification and real-time monitoring across multiple liquid handlers.
  - Built pre-execution validation and a hybrid rule + LLM tool-calling recovery agent that repairs failures during a run.
  - Created a 48-task real-experiment planning suite and a 96-scenario fault-injection simulator; benchmarked against 8 LLMs and agent baselines.
---

## Motivation

Lab automation hardware is capable, but turning a scientific goal into a correct, machine-executable protocol still takes expert effort, and runs fail in ways that are hard to anticipate. AutoBioLab asks how far LLM agents can close that gap safely.

## Approach

The system splits the work across specialized agents that plan the experiment, verify the generated protocol, and monitor execution on the liquid handlers. Validation checks catch command errors before anything runs; during execution, a hybrid recovery agent combines hand-written rules with LLM tool calls to detect and repair failures.

## Evaluation

- A 48-task planning suite built from real experiments.
- A 96-scenario fault-injection simulator for testing recovery.
- Three rounds of testing, compared against 8 LLMs and agent baselines.

The paper is currently under review.
