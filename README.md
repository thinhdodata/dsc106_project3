# Different futures, different temperatures

DSC 106 Project 3 — interactive visualization of global CMIP6 temperature projections across five Shared Socioeconomic Pathways (SSPs), 2021–2100.

## Live site

After GitHub Pages has been enabled, paste the published URL here: **[add site URL]**.

## What is included

```text
index.html                 Main web page + write-up
styles.css                 Light, academic visual design
script.js                  All D3.js charting and interaction code
data/cmip6_decadal.csv     8 decades × 5 scenarios (published CMIP6 means)
DATA_SOURCES.md            Provenance, transformations, and data limitations
README.md                  How to deploy, test, and customize
```

This is a **static website**. It requires no backend, Node build step, or plotting library other than **D3.js** (loaded from jsDelivr). The project works on GitHub Pages.

## How to publish on GitHub Pages

1. Create a **public GitHub repository** for the project (or use the team's existing public repository).
2. Upload/commit **all of the files listed above to the root of the repo**. Keep the `data` folder and its CSV intact. **Do not add an extra parent folder** when uploading the contents of this project.
3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/(root)**. Save.
5. After GitHub Pages deploys, open the published link. Your URL will usually have the format `https://YOUR-USERNAME.github.io/REPO-NAME/`.
6. Test filters, measure selector, slider, 2°C toggle, and both linked charts. Then submit the **published URL** on Gradescope (not the repository code URL).

If you already have a repository that deploys from `docs/`, put the **contents** of this folder inside `docs/` and set the Pages folder to `/docs` instead. Avoid changing working repository settings unless necessary.

## What MUST be personalized before submitting

Open `index.html` and find the paragraph with `id="team-contributions"` in the **Development process** section. **Replace the placeholder** with truthful details about:

- Team name and members (3–4 students, as applicable).
- Who contributed what (e.g., data sourcing/validation, visual design, D3 interactions, accessibility/testing, write-up, GitHub deployment).
- Approximate **total people-hours** your team spent developing the application.
- The component that took the most time and why.

These facts are required by the rubric; do not invent contributions or keep the placeholder. If your team has a different officially registered project title or topic, confirm the published content matches what you submitted at checkpoint.

## Run locally

Opening `index.html` using `file://` may block the CSV due to browser security rules. Use a small static web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. An internet connection is required to load D3 from the public CDN. There are no Python dependencies in the website.

## Interactions

- Check/uncheck scenarios, or choose **All five** / **Compare extremes**.
- Switch between **Warming** and **Difference from SSP1-1.9**.
- Toggle the **2°C reference line** (absolute warming view only).
- Use the **selected-decade slider** or the **2021–2030 / 2091–2100** shortcuts.
- **Hover** the main chart to inspect scenario values for a decade; **click** to update the linked views.
- View a **linked ranking chart** for the selected decade.
- Use the **linked spread chart** to show how the maximum-minus-minimum gap changes over time. Click a decade in that chart to update the selection.
- Use **Reset view** to restore the defaults.

## Design choices and methodology

The complete write-up is on the website under **About this visualization**. The underlying dataset, source license, precise transformations, and important caveats are explained in [DATA_SOURCES.md](DATA_SOURCES.md).

## Rubric checklist

- [x] Approved CMIP6 dataset, specific question, and focused scope
- [x] Appropriate line and point encodings with labeled axes and color-keyed series
- [x] Scenario filters + baseline difference view + benchmark + slider + details-on-demand
- [x] Two linked views and dynamic max–min spread transformation
- [x] Documented calculations and dataset limitations
- [x] Rationale for marks, colors, interactions, and rejected alternatives
- [x] Static, public-page-ready D3 source files
- [ ] **Team-specific work breakdown, time estimate, and hardest problem filled in**
- [ ] **GitHub Pages URL published and tested on at least two screen sizes**
- [ ] **Live URL submitted to Gradescope by Friday, Nov 13, 2026, 11:59 PM**

No grade or bonus points are guaranteed; this checklist is intended to help you address every category in the assignment's rubric.
