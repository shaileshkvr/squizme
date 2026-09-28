# Documentation: @/docker-compose.yml

### Purpose
Defines local development and test infrastructure including a lightweight PostgreSQL 16 container (`postgres:16-alpine`) with health checks and persistent volume storage.

### What happens without it
Developers must manually install, configure, and maintain a local PostgreSQL instance or configure cloud database credentials (such as Supabase).

### Configuration details
- Image: `postgres:16-alpine`
- Service: `postgres`
- Port mapping: `5432:5432`
- Healthcheck: `pg_isready -U postgres -d squizme`
- Volume: `postgres_data` mapped to `/var/lib/postgresql/data`

### Dependency graph
- Depends on: None.
- Depended on by: `@/apps/server` database connection.
