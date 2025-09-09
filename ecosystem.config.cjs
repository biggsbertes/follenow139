module.exports = {
  apps: [
    {
      name: "correios-api",
      cwd: "/var/www/correios",
      script: "server.mjs",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3001,
        CONFIG_ENC_KEY: "troque_para_uma_chave_de_32_chars_________"
      }
    }
  ]
}