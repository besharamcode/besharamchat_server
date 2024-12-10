module.exports = {
  apps: [
    {
      name: "besharamchat",
      script: "src/app.js", // Node.js application
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
