# Development Ports

Local website projects use the `3200-3499` range so they can run side by side without collisions. Software, tooling, and non-website development projects should use `5100-5999`.

## Assigned Ports

| Surface | Port |
| --- | ---: |
| Vaexil.tv site | `3203` |

The `npm run dev` script already uses this assigned port by default. Override with `PORT=...` only for temporary local debugging.
