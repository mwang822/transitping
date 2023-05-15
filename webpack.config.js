const path = require('path');
const dotEnv = require('dotenv-webpack');

module.exports = {
  entry: './src/javascript/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname,'public','dist'),
  },
  plugins: [
    new dotEnv()
  ]
};
