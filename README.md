# My Web App

This is a chromeless web app designed to run on an iPad, served by a Node.js and Express server.

## Features

- Full-screen, chromeless experience
- Service worker for offline support
- PWA (Progressive Web App) features
- Prevents pinch zoom for a consistent user interface

## Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Run the server:

    ```sh
    node server.js
    ```

4. Open your web app in the browser:

    Navigate to `http://localhost:3000` on your iPad or another device on the same network.

## Project Structure

```plaintext
my-webapp/
│
├── public/
│   ├── app.js
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   └── styles.css
│
├── .gitignore
├── package.json
├── server.js
└── README.md

License
This project is licensed under the MIT License.