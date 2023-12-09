# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /app

COPY . /app
RUN bun i

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "start" ]

