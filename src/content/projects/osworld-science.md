---
title: "OSWorld-Science: Computer-Use Agents on Scientific Software"
summary: A benchmark that tests whether AI agents can operate real scientific software on a virtual desktop. I built its chemistry domain, the largest and hardest part of the benchmark.
start: 2026-07
end: 2026-09
role: Remote Research Assistant (co-author)
lab: Northeastern University · Dr. Tianyu Liu & Prof. Wengong Jin
tags: [Computer-Use Agents, Benchmark, Cheminformatics]
featured: true
order: 2
cover: ../figures/osworld-science.png
contributions:
  - Built the chemistry task set, 43 tasks (about 30% of the benchmark), each with an automatic RDKit grader for SMILES, InChIKey and stereochemistry.
  - Connected the tasks to the OSWorld agent harness and evaluated frontier models.
  - Chemistry turned out to be the hardest domain; the best model solved only about 44% of its tasks.
links:
  arxiv: https://arxiv.org/abs/2609.39903
---

## What it measures

OSWorld-Science gives agents real scientific desktop software and checks the files they produce, rather than their text answers. Tasks span domains such as chemistry, pathology image analysis, statistics and physical simulation.

## My part

I designed the chemistry domain: tasks like drawing molecules and planning syntheses in real chemistry software, each graded automatically by comparing the agent's output molecule with RDKit (canonical SMILES, InChIKey and stereochemistry). I also wired the tasks into the OSWorld harness and ran the model evaluations.
