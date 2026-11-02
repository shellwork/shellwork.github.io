---
title: "CryoPASS: Domain Adaptation for Cryo-ET Segmentation"
summary: Segmenting proteins in real cryo-electron tomograms without any real voxel labels, by adapting models trained on simulated data while avoiding the collapse that sparse foregrounds usually cause.
start: 2025-10
end: 2026-07
role: Research Assistant (first author)
lab: Carnegie Mellon University · Prof. Min Xu
tags: [Cryo-ET, Domain Adaptation, 3D Segmentation]
featured: true
order: 3
cover: ../figures/cryopass.png
contributions:
  - Trained 3D protein segmentation models on simulated cryo-ET and adapted them to real tomograms with no real labels.
  - Developed a collapse-free adaptation method (foreground-balance loss, Fourier style alignment, prototype pseudo-labels) that beats the best baseline by 1.8× and reaches 78% of the fully supervised upper bound.
  - Built a benchmark of 9 baselines across backbones and datasets; our method was also the most stable across random seeds.
---

## Problem

Simulated cryo-ET data comes with perfect labels, but real tomograms look different and proteins occupy a tiny fraction of the volume. Standard unsupervised adaptation tends to collapse and predict background everywhere.

## Approach

CryoPASS keeps the foreground alive with a foreground-balance loss, narrows the appearance gap with Fourier-domain style alignment, and refines training with prototype-based pseudo-labels.

## Results

The method improves on the strongest baseline by 1.8× and recovers 78% of the fully supervised upper bound, while being the most stable method across random seeds. The paper is under review at AAAI.
