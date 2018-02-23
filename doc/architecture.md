# Architecture

## Assets

An asset is a self-contained JSON document, with a V4 UUID identifying it, and
a reference to its parent asset (if any).

Each asset's schema is designed to be modifiable with "patches", and so that no
change requires a patch be applied to more than one asset at a time.  

To achieve this, schema design needs to follow a "more relational" philosophy, 
with "foreign keys" rather than lists of child assets (as transferring an asset 
between parents would otherwise require modifying both the old and new parent).  
This can make lookups of child objects quite slow (as it requires a "table 
scan") and schemas a little verbose.

The diff/patch algorithm additionally considers any array to be a value as a
whole; [1, 2, 3] -> [1, 2, 3, 4] is seen as a replacement of the former with the
latter, not a mere append.  This is because conflicts can arise when trying to
merge ordered lists.