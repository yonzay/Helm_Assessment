# Helm_Assessment
 Take home assessment from Helm.

## Getting Started

Make sure Node.js is installed and clone this repo using `git clone https://github.com/yonzay/Helm_Assessment.git`

In the root directory run `npm i` to install all necessary dependencies

In `.env.json` change the key `mongodb_url` to your authenticated MongoDB URL

Warning: The IP address and port number are hard coded in the front-end so for it to work make sure nothing else is listening on those specified ports

Now you should be able to run `npm run backend` from the root directory to start the server

Additionally in another terminal that also resides in the root directory you should be able to run `npm run dashboard` to start the front-end. Navigate to http://localhost:3000/register when the front-end starts

## API Documentation