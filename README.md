# Nuxt.js & Redis Stack Blog

A modern, high-performance blog boilerplate built with Nuxt.js, Redis, and Docker. This project demonstrates how to use Redis as a primary database for a content-driven application, leveraging its speed and powerful data structures.

## ✨ Features

- **🚀 Nuxt.js Frontend:** A fast and modern Vue.js framework for server-side rendering (SSR).
- **⚡ Redis as Primary Database:** Uses Redis for ultra-fast data access.
- **📦 Dockerized Environment:** Fully containerized with `docker-compose` for easy setup and consistent development/production environments.
- **📈 Sorted Sets for Timelines:** Efficiently retrieves posts in chronological order.
- **📜 Seeding Script:** Includes a script to populate the database with sample posts.
- **🔒 Data Persistence:** Configured with Docker named volumes to ensure your data persists across container restarts.

## 🛠️ Tech Stack

- **Frontend:** [Nuxt.js 3](https://nuxt.com/)
- **Database:** [Redis Stack](https://redis.io/docs/latest/operate/oss_and_stack/stack/) (includes RedisJSON)
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **TypeScript Runtime:** [tsx](https://github.com/esbuild-kit/tsx)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system.
- [Node.js](https://nodejs.org/) (v18.x or later) and [npm](https://www.npmjs.com/).

### 1. Clone the Repository

```bash
# Clone this repository to your local machine
git clone 'git@github.com:melasistema/redis-blog.git'
cd 'redis-blog'
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Start the Docker Containers

This command will build the Docker images and start the Nuxt.js and Redis containers in the background.

```bash
docker-compose up -d --build
```

### 4. Seed the Database

Run the seeding script to populate the Redis database with sample blog posts.

```bash
npm run seed
```

### 5. View Your Blog

The application should now be running.
- **Blog Frontend:** [http://localhost:3000](http://localhost:3000)
- **RedisInsight GUI:** [http://localhost:8001](http://localhost:8001) (to visually inspect your Redis data)

## 🌟 Credits

This project is made possible by the inspiration, contributions, and tools of an incredible community. A heartfelt thank you to:

-   **👨‍💻 Author**: [Luca Visciola](https://github.com/melasistema) – Passionate drummer and developer. Reach out at [info@melasistema.com](mailto:info@melasistema.com) for inquiries or feedback.

-   **🚀 Inspired by Salvatore Sanfilippo**: The foundation of this project stems from the unreachable talent of [Salvatore Sanfilippo](https://antirez.com/latest/0). Discover the magic and speed of  [Redis](https://github.com/redis/redis).


### 🙌 Special Thanks

To the open-source community and all contributors—your dedication and collaboration inspire innovation and make projects like this possible. 🌟


## 📝 License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE.md) file for details.
