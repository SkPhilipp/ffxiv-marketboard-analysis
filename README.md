# FFXIV Marketboard Analysis

This is a project which analyses item prices for estimating arbitrage and crafting profits in the game Final Fantasy XIV by Square Enix.

Somewhere during the 2020 quarantines me and my friends picked up FFXIV and I threw together this project, if you're looking for code quality this isn't it, if you're looking to estimate your profits on your lv. 80 omnicrafter then this is the project you're looking for.

## Installation

    npm install

## Bug: Arbitrage

Cross-server prices are not being loaded and instead default to Shiva.

## Bug: Demand

This is incorrect:

```Emperor's Throne               40915             1680000                0.41               4006%```

## New: Preconfigured Watch Files

Watch files for:

- Crafting quest items
- Gathering
- Venture rewards
- Map allowances- Cross-class Ingredient Requirements:
    - Gemsmith's Gems
    - Leatherworker's Leathers
    - Carpenter's Lumbers
    - Alchemist's Alkahests & Glues

## New: Historic price adjustment activity

Certain items could be competed in easily if all the competitors are inactive.
This could be watched for.

## New: Server

```bash
for watch_file in $(ls watches); do
    index.js {watch_file} | grep -v'populating' | markdown2html > "${watch_file}.html"
end
```
