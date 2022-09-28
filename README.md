# pr-auto-close

> A GitHub App built with [Probot](https://github.com/probot/probot) that auto closes pull requests from forks.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t pr-auto-close .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> pr-auto-close
```

## Contributing

If you have suggestions for how pr-auto-close could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

