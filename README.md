# Data Streams - Streams Direct implementation (TypeScript)

## Prerequisites

- Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). Run `git --version` to check the installation.
- Install [Nodejs](https://nodejs.org/en/) version 16 or later.

## Set up

- Clone the repository.

- Copy the .env.example file to .env and fill in the values.

  ```
  cp .env.example .env
  ```

- Install all dependencies:

  ```
  npm install
  ```

- Compile the TypeScript code:

  ```
  npm run build
  ```

## Fetch and decode a report with a single feed

Run the following command to fetch and decode a single feed (e.g. for ETH / USD on testnets):

```
node dist/main-single-feed.js 0x000359843a543ee2fe414dc14c7e7920ef10f4372990b79d6361cdc0dd1ba782
```

## Fetch and decode multiple reports for many feeds

Run the following command to fetch and decode multiple feeds (e.g. for ETH / USD and LINK / USD on testnets):

```
node dist/main-multiple-feeds.js 0x000359843a543ee2fe414dc14c7e7920ef10f4372990b79d6361cdc0dd1ba782 0x00036fe43f87884450b4c7e093cd5ed99cac6640d8c2000e6afc02c8838d0265
```
