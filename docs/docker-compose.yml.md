# Documentation: @/docker-compose.yml

### Purpose
Defines local development and test infrastructure including MySQL 8 container with health checks.

### What happens without it
Developers must manually install, configure, and maintain a local MySQL 8 database instance.

### Dependency graph
- Depends on: None.
- Depended on by: `@/apps/server` database connection.
