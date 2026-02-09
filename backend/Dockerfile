FROM oven/bun:latest

WORKDIR /app

# Copy package.json and lockfile
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy the rest of the code
COPY . .

EXPOSE 3001
ENV PORT=3001

CMD ["bun", "run", "start:dev"]
