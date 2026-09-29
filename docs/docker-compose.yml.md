# Documentation: @/docker-compose.yml

### Purpose
Defines container services for running PostgreSQL 16 Alpine database and the containerized Squizme full-stack app with health check dependencies.

### What happens without it
Developers and operators must manually start, configure, and link local PostgreSQL and Node runtimes.

### Services
- `postgres`: PostgreSQL 16 Alpine image configured with database `squizme`, standard port 5432, persistent volume `postgres_data`, and `pg_isready` healthcheck.
- `app`: Production container built from `@/Dockerfile`, waiting on healthy database status, serving HTTP traffic on port 3001.

### Dependency graph
- Depends on:
  - `@/Dockerfile`
- Depended on by:
  - Docker Compose CLI
