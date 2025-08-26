Here's a version formatted for easy copy-and-paste into a Markdown file.

# BSerUi Local Installation and Deployment

-----

This guide provides step-by-step instructions for installing and running the BserUI on your local machine. This project was built using **Angular 19**.

### Prerequisites

Before you start, make sure you have the following software installed.

  * **Node.js**: The recommended version is **v22.16.0** or later.
  * **npm**: The recommended version is **v10.9.2** or later.

You can check your installed versions by running `node -v` and `npm -v` in your terminal.

-----

### Step-by-Step Installation

1.  **Clone the Repository**

    Clone the source code from the project's [GitHub repository](https://github.com/BSeR-PoC/bser-ui.git) using the following command in your terminal:

    ```bash
    git clone https://github.com/BSeR-PoC/bser-ui.git
    ```

2.  **Install Dependencies**

    Navigate into the cloned project folder and install all necessary dependencies using npm:

    ```bash
    cd bser-ui
    npm install
    ```

3.  **Start the Application**

    Start the application using the Angular CLI. The `--ssl=true` flag is required to run the application with a secure HTTPS connection.

    ```bash
    ng serve --ssl=true
    ```

4.  **Launch the Application**

    Finally, open the [Smartchart Launcher](https://launch.smarthealthit.org/). In the launcher, set the **App's Launch URL** to:

    ```
    https://localhost:4200/launch
    ```

    This will launch the application in your browser.
