# Data sources and interpretation

## Original data

This project uses the **CMIP6** global-mean surface-air temperature anomaly multi-model means published in:

- Mathias Hauser, **CMIP TEMPERATURES**: https://github.com/mathause/cmip_temperatures
- Original source CSV: https://github.com/mathause/cmip_temperatures/blob/main/cmip6_mmm_temperatures_one_ens_1850_1900.csv
- DOI: https://doi.org/10.5281/zenodo.5532894
- Data license: [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)

The file `data/cmip6_decadal.csv` is a **subset/transformation of the original CMIP6 source CSV**, which preserves the two-decimal published multi-model means. It is not a simulation and does not contain new climate observations. The original source is credited in the website footer, text, and this document; the derived CSV is distributed under CC BY-SA 4.0.

## How the subset was created

1. Used the source's multi-model mean table with **one ensemble member per model**.
2. Retained the eight disjoint decade periods, `2021-2030` through `2091-2100`.
3. Retained the columns for the five SSPs: `SSP1-1.9`, `SSP1-2.6`, `SSP2-4.5`, `SSP3-7.0`, `SSP5-8.5`.
4. Removed the model count suffix from each header to make it easier to load with D3; model counts are documented below and in the UI.
5. No observations or models were filtered from **within** the published source aggregates. No interpolation, smoothing, or extrapolation was performed.

The original project uses global area weights (or cosine latitude weighting where grid-cell areas are missing), combines historical and scenario data, subtracts a model-specific 1850–1900 mean, and computes the average over each defined period. Its multi-model mean values were calculated from that output.

## Number of models represented

| Scenario | Models |
|---|---:|
| SSP1-1.9 | 14 |
| SSP1-2.6 | 41 |
| SSP2-4.5 | 42 |
| SSP3-7.0 | 35 |
| SSP5-8.5 | 44 |

Because different ensembles contribute to each pathway's raw mean, pathway differences are **descriptive** rather than matched-model experimental differences. The source explicitly calls these *raw (unassessed) multi-model means*, distinct from IPCC assessed projection ranges.

## Derived interactions (computed in browser)

- **Warming:** Published raw decadal CMIP6 mean for the selected SSP (°C relative to 1850–1900).
- **Difference from SSP1-1.9:** The selected scenario's mean **minus SSP1-1.9's mean in the same period**. This is a simple arithmetic difference between reported aggregate means.
- **Spread:** `max(visible scenario means) - min(visible scenario means)` in each period. It depends on which boxes are checked.
- **2°C reference:** A visual line at 2°C on the warming chart. It is not an official assessment of threshold-crossing year.

## Checks of the 8-row CSV

- 2021–2030 across all five SSPs: min `1.43°C`, max `1.54°C`, spread `0.11°C`.
- 2091–2100 across all five SSPs: min `1.50°C`, max `5.31°C`, spread `3.81°C`.

These examples are reproduced from the source table; values are relative to the 1850–1900 baseline.
