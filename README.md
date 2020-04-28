# Installation

    npm install

## Bug: Arbitrage

Cross-server prices are not being loaded and instead default to Shiva.

## Bug: Demand

This is incorrect:

```Emperor's Throne               40915             1680000                0.41               4006%```

## New: watch file configuration

watch files would look as such (see watches/crafted-rares.json)

Supporting:

- Item lookup method.
    - Direct (default, the given item)
    - EndIngredientOf (items which the given item goes into, recursively)
- Score method.
    - Crafted (default; regular items sold around ~2 demand)
    - CraftedRare (amount for sale, amount sold)
    - Gathering (quantities sold)
    - Arbitrage (price on other server)

## New: Preconfigured Watch Files

Watch files for:

- Crafting quest HQ items

- Gathering
    - Venture rewards
    - Botany Items
        - Standard Gathering
        - Unsploiled Nodes
        - Aetherial Reduction
        - Legendary Nodes
    - Mining Items
        - Standard Gathering
        - Unsploiled Nodes
        - Aetherial Reduction
        - Legendary Nodes
    - Fishing Items

- Glamour Items
    - A Realm Reborn Boss Weapons

- Cross-class Ingredient Requirements:
    - Gemsmith's Gems
    - Leatherworker's Leathers
    - Carpenter's Lumbers
    - Alchemist's Alkahests & Glues

## New: Historic price adjustment activity

Certain items could be competed in easily if all the competitors are inactive.
This could be watched for.

## New: Modes

Run as `ffxiv --file {watch_file}`.

Processes the watch file and displays the top 20 scored items.

Run as `ffxiv --server {configuration_directory}`.

Server mode would refresh the watched items every hour or so.
Under `/` displays an a list of all watchfiles by their configured name.
Under `/watch/{file}?top={top}` the file's watches' scored items can be viewed, with links to their page. `top` is max 1000.
Under `/item/{id}` items' tree are displayed as such;

    Endless Expanse Astrometer
    - 5x Battlecraft Demimateria III
    - ...
    - 3x Eikon Mythril Ingot
        - 2x Eikon Mythril (6x)
        - ...

## New: Multi-Item Lookup

Refreshes could ask Universalis to supply data on multiple items instead of just one.
