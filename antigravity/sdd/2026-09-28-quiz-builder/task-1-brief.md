### Task 1: Monorepo workspace initialization and root configuration

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `docs/package.json.md`
- Create: `docs/pnpm-workspace.yaml.md`
- Create: `docs/docker-compose.yml.md`

**Interfaces:**
- Produces: Monorepo root workspace with script coordination (`pnpm build`, `pnpm test`, `pnpm dev`).

- [ ] **Step 1: Create root pnpm workspace and package configuration**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Create root `package.json`:
```json
{
  "name": "squizme-monorepo",
  "private": true,
  "scripts": {
    "dev:server": "pnpm --filter @squizme/server dev",
    "dev:client": "pnpm --filter @squizme/client dev",
    "dev": "pnpm --parallel dev:server dev:client",
    "build": "pnpm --recursive run build",
    "test": "pnpm --recursive run test"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true
  }
}
```

Create `.gitignore`:
```
node_modules
dist
.env
*.log
coverage
```

Create `.env.example`:
```
PORT=3001
DATABASE_URL=mysql://root:rootpassword@localhost:3306/squizme
JWT_SECRET=super-secret-jwt-key-minimum-32-chars-long
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DEFAULT_GEMINI_API_KEY=
VITE_API_URL=http://localhost:3001
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: squizme-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: squizme
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  mysql_data:
```

- [ ] **Step 2: Create mirrored docs for root config files**

Create `docs/package.json.md`:
```markdown
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
```

Create `docs/pnpm-workspace.yaml.md`:
```markdown
# Documentation: @/pnpm-workspace.yaml

### Purpose
Declares the package directory patterns for pnpm workspaces.

### What happens without it
pnpm treats the repository as a single package and fails to link `@squizme/shared` to apps.

### Dependency graph
- Depends on: None.
- Depended on by: Root pnpm CLI.
```

Create `docs/docker-compose.yml.md`:
```markdown
# Documentation: @/docker-compose.yml

### Purpose
Defines local development and test infrastructure including MySQL 8 container with health checks.

### What happens without it
Developers must manually install, configure, and maintain a local MySQL 8 database instance.

### Dependency graph
- Depends on: None.
- Depended on by: `@/apps/server` database connection.
```

- [ ] **Step 3: Verify workspace setup**

Run: `pnpm install`
Expected: `Lockfile is up to date` or packages resolved cleanly.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize pnpm monorepo workspace and root configs"
```

---

