# Installation

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
