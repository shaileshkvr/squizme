# Documentation: @/package.json

### Purpose
Defines root workspace scripts and root dependencies for the Squizme monorepo.

### What happens without it
pnpm cannot resolve workspace members or run unified build and test scripts across apps and packages.

### Exports / Scripts
- `dev`: Runs server and client concurrently.
- `build`: Builds all workspace packages in topological order.
- `test`: Executes tests across packages.

### Dependency graph
- Depends on: None.
- Depended on by: All child workspace members.
