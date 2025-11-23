# Redis Nuxt Blog

A modern, high-performance blog boilerplate built with Nuxt.js 3, Redis Stack, and Docker. This project demonstrates how to leverage Redis as a primary, ultra-fast database for a content-driven application, showcasing its speed and powerful data structures within a robust Nuxt.js environment.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configuration](#3-configuration)
  - [4. Running with Docker Compose (Recommended)](#4-running-with-docker-compose-recommended)
  - [5. Running Locally (Development)](#5-running-locally-development)
  - [6. Seed the Database](#6-seed-the-database)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [Special Thanks](#special-thanks)
- [License](#license)

## Overview
This project provides a comprehensive boilerplate for a blog application, integrating Nuxt.js 3 for a modern frontend and API layer with Redis Stack (including RedisJSON for structured data and RediSearch for powerful search capabilities) as the backend data store. It's designed for developers looking for a high-performance, scalable, and easily deployable blog solution using Docker.

## ✨ Features

-   **🚀 Nuxt.js Frontend:** A fast and modern Vue.js framework for server-side rendering (SSR), providing excellent SEO and user experience.
-   **⚡ Redis as Primary Database:** Utilizes Redis Stack for ultra-fast data access, leveraging RedisJSON for efficient document storage and RediSearch for advanced querying.
-   **📦 Dockerized Environment:** Fully containerized with `docker-compose` for easy setup, consistent development, and reliable production deployments.
-   **📈 Sorted Sets for Timelines:** Efficiently retrieves posts in chronological order, ensuring optimal performance for blog feeds.
-   **📜 Seeding Script:** Includes a convenient script to populate the database with sample posts, accelerating initial setup and testing.
-   **🔒 Data Persistence:** Configured with Docker named volumes to ensure your valuable data persists across container restarts and updates.

## 🛠️ Tech Stack

-   **Frontend & API:** [Nuxt.js 3](https://nuxt.com/)
-   **Database:** [Redis Stack](https://redis.io/docs/stack/) (RedisJSON, RediSearch)
-   **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
-   **TypeScript Runtime:** [tsx](https://github.com/esbuild-kit/tsx)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Docker](https://www.docker.com/get-started) installed and running on your system.
-   [Node.js](https://nodejs.org/) (v18.x or later) and [npm](https://www.npmjs.com/) installed.

### 1. Clone the Repository

```bash
git clone 'git@github.com:melasistema/redis-blog.git'
cd 'redis-blog'
```

### 2. Install Dependencies

Install the project's Node.js dependencies:

```bash
npm install
```

### 3. Configuration

The application uses environment variables for configuration. You can use the provided `.env.example` and `.env.secret.example` files as templates.

*   **For Development:** Copy `.env.example` to a new file named `.env` for local development.
    ```bash
    cp .env.example .env
    ```
    The default values in this file are configured to work with the Dockerized Redis instance.

*   **For Production:** The `.env.secret.example` file outlines sensitive variables. Create a `.env.secret` file for your production environment and ensure it is handled securely and not committed to version control.

#### Environment Variables

| Variable Name             | Description                                                                  | Docker Compose Value (Example)     | Local `.env` Value (Example)      |
|---------------------------|------------------------------------------------------------------------------|------------------------------------|-----------------------------------|
| `NUXT_URL`                | Base URL for the Nuxt application. Essential for internal requests and link generation. | `http://0.0.0.0:3000`            | `http://localhost:3000`         |
| `NUXT_REDIS_URL`          | Direct Redis connection URL. Used by `npm run seed` and for some Redis commands. | `redis://redis:6379`               | `redis://localhost:6380`          |
| `NUXT_PUBLIC_REDIS_HOST`  | Redis hostname for connections, exposed via public runtime config.           | `redis`                            | `localhost`                       |
| `NUXT_PUBLIC_REDIS_PORT`  | Redis port for connections, exposed via public runtime config.               | `6379`                             | `6380`                            |
| `REDIS_PASSWORD`          | The password for your Redis instance. (Handled in `.env.secret`)            | `your-secure-password`             | `your-secure-password`            |

### 4. Running with Docker Compose (Recommended)

This command will build the Docker images and start both the Nuxt.js application and Redis Stack containers.

```bash
docker compose up -d --build
```

Once started, access the application at: [http://localhost:3000](http://localhost:3000)

### 5. Running Locally (Development)

To run the Nuxt.js application in development mode on your host machine while still using the Dockerized Redis:

1.  **Start only the Redis Stack service:**
    ```bash
    docker compose up redis -d
    ```
2.  **Start the Nuxt development server:**
    ```bash
    npm run dev
    ```
    Access the application at: [http://localhost:3000](http://localhost:3000)

### 6. Seed the Database

After starting either with Docker Compose or locally (and Redis is running), populate the Redis database with sample blog posts:

```bash
npm run seed
```

## How To

### Create a New Post

You can create a new blog post using the command-line interface.

```bash
npm run new-post "{title}" "{content}" "{tags}"
```

-   `{title}`: The title of your blog post.
-   `{content}`: The full HTML content of your post.
-   `{tags}`: A comma-separated list of tags (e.g., "nuxt,redis,tutorial").

### API Endpoints
The application exposes the following API endpoints:

| Endpoint                  | Method | Description                                       |
|---------------------------|--------|---------------------------------------------------|
| `/api/posts`              | `GET`  | Retrieves a list of recent blog posts.            |
| `/api/posts/:slug`        | `GET`  | Retrieves a single blog post by its unique slug.  |
| `/api/tags`               | `GET`  | Retrieves a list of all unique tags.              |
| `/api/posts/:slug/toggle-published` | `PUT` | Toggles the published status of a post. (Not yet implemented in UI) |

### Troubleshooting

-   **`ECONNREFUSED` errors:** If you encounter connection refused errors (e.g., for Redis or internal API calls), ensure both your Nuxt application and Redis services are running. Verify your environment variables (`NUXT_URL`, `NUXT_PUBLIC_REDIS_HOST`, `NUXT_PUBLIC_REDIS_PORT`) are correctly configured for your specific environment (Docker Compose vs. Local Development).
-   **No posts or tags displayed:** Run `npm run seed` to populate the Redis database.
-   **`[Vue Router warn]: No match found for location with path "/_nuxt/"`**: This warning is generally benign in a production build. It indicates an attempt to navigate to a static asset path and typically doesn't affect the core functionality of the application.

### 🌟 Credits

This project is made possible by the inspiration, contributions, and tools of an incredible community.

-   **👨‍💻 Author**: [Luca Visciola](https://github.com/melasistema) – Passionate drummer and developer. Reach out at [info@melasistema.com](mailto:info@melasistema.com) for inquiries or feedback.
-   **🚀 Inspired by Salvatore Sanfilippo**: The foundation of this project stems from the unreachable talent of [Salvatore Sanfilippo](https://antirez.com), the creator of [Redis](https://github.com/redis/redis).

### 🙌 Special Thanks

To the open-source community and all contributors—your dedication and collaboration inspire innovation and make projects like this possible. 🌟

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.md) file for details.