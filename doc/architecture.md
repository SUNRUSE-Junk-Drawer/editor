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

### Example JSON

```json
{
    "name": "user-friendly name for the asset",
    "type": "invariant name for the asset type",
    "parentFolderId": "an identifier or null",
    "data": {
        "asset type specific": true
    }
}
```

### Adding new types

Existing asset types are in `src/client/asset-types`; each is a module 
including:

| Name          | Description                                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| label         | User-friendly label for the asset type.                                        |
| thumbnailView | JSX/Picodom view used to render a 1x1em preview an instance of the asset type. |
| editorView    | JSX/Picodom view used to render an editor for an instance of the asset type.   |

These must then be added to the `src/client/asset-types/index.js` module, using
its invariant type name.

Adding documentation for new or altered types to `doc/asset-types` is 
recommended.

## Server-client communication

The server is the "one source of the truth" for assets; they are created, and
modified there.  Clients consume events sent back to synchronize their cache of
the assets with those of the server.

### Event flow for update

- The user makes a change.
- The client-side Picodom view triggers an event.
- A message is sent to the server via a websocket.
- The server applies the patch to its local copy, persisting it to disk.
- The patch is then distributed to all clients via websockets.
- Clients apply the patch to their local copies, and update their Picodom views.