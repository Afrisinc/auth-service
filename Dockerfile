FROM node:20-bullseye AS builder

WORKDIR /app


# Install OpenSSL 1.1
RUN apt-get update && apt-get install -y libssl1.1 bash

# Enable Corepack for runtime commands (docker exec yarn …)
RUN corepack enable \
 && corepack prepare pnpm@latest --activate

# Copy dependencies
COPY package.json pnpm-lock.* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy rest of the code
COPY . .

# Generate Prisma client
RUN npm install -g prisma@5.22.0 @prisma/client@5.22.0
RUN npx prisma generate

# Build app (if TypeScript)
RUN pnpm build

# Final image
FROM node:20-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y libssl1.1 bash
COPY --from=builder /app ./
EXPOSE 8092

# Create startup script that runs migrations and starts the app
RUN echo '#!/bin/bash\nset -e\nnpx prisma migrate deploy\nnode dist/server.js' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
