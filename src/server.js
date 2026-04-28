import { createServer } from 'node:http';
import { publisher, subscriber, Redis, rateLimiter } from '../redis-connection.js';

import { Server } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

async function main() {

     const app = express();
     const server = createServer(app);
     const io = new Server(server);

     app.use(express.static('public'));

    

     const BOX_SIZE = 500;
     const CHECKBOX_KEY = 'checkbox';

     // subscribe to Redis channel for internal updates
     await subscriber.subscribe('InternalUpdate');

     //  listen for messages
     subscriber.on('message', (channel, message) => {
          if (channel === 'InternalUpdate') {
               const { idx, checked } = JSON.parse(message);

               io.emit('server:update', { idx, checked });
          }
     });

     io.on('connection', (socket) => {

          socket.on('client:toggle', async ({ idx, checked }) => {

               const key = `rate_limit:${socket.id}`;
               const currentTime = Date.now();

               const lastActionTime = await rateLimiter.get(key);

               //  block if less than 1 second
               if (lastActionTime && currentTime - lastActionTime < 1000) {
                    console.log(`Rate limit exceeded for socket ${socket.id}`);
                    return socket.emit('rate_limit_exceeded');
               }

               // save current time 
               await rateLimiter.set(key, currentTime);

               // update state in Redis
               const existingState = await Redis.get(CHECKBOX_KEY);

               let data = existingState
                    ? JSON.parse(existingState)
                    : new Array(BOX_SIZE).fill(false);

               data[idx] = checked;

               await Redis.set(CHECKBOX_KEY, JSON.stringify(data));

               //  publish event
               await publisher.publish(
                    'InternalUpdate',
                    JSON.stringify({ idx, checked })
               );
          });

     });

     app.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, 'index.html'));
     });

     app.get('/init', async (req, res) => {
          const existingState = await Redis.get(CHECKBOX_KEY);

          if (existingState) {
               return res.json(JSON.parse(existingState));
          }

          const initialState = new Array(BOX_SIZE).fill(false);

          await Redis.set(CHECKBOX_KEY, JSON.stringify(initialState));

          res.json(initialState);
     });

     server.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
     });
}

main();