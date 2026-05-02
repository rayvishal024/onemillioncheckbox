import { createServer } from 'node:http';
import { publisher, subscriber, RedisClient, rateLimiter } from '../redis-connection.js';

import { Server } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';
import { authMiddleware } from './auth.middleware.js';

import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";

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

     // serve static files
     app.use(express.static('public'));

     // auth middleware for socket.io
     io.use(authMiddleware);

     const BOX_SIZE = 2000;
     const CHECKBOX_KEY = 'checkbox';

     // subscribe to Redis channel for updates
     await subscriber.subscribe('InternalUpdate');

     // handle messages from Redis and broadcast to clients
     subscriber.on('message', (channel, message) => {
          if (channel === 'InternalUpdate') {
               const { idx, checked } = JSON.parse(message);
               io.emit('server:update', { idx, checked });
          }
     });

     // handle client connections and events
     io.on('connection', (socket) => {

          // handle checkbox toggle from client
          socket.on('client:toggle', async ({ idx, checked }) => {

               //  block unauthenticated users
               if (!socket.user) {
                    return socket.emit('error', 'Login required');
               }

               //  rate limit 
               const key = socket.user?.userId
                    ? `rate_limit:${socket.user.userId}`
                    : `rate_limit:${socket.id}`;

               const currentTime = Date.now();
               const lastActionTime = await rateLimiter.get(key);

               if (lastActionTime && currentTime - lastActionTime < 1000) {
                    return socket.emit('rate_limit_exceeded');
               }

               await rateLimiter.set(key, currentTime);

               const existingState = await RedisClient.get(CHECKBOX_KEY);

               let data = existingState
                    ? JSON.parse(existingState)
                    : new Array(BOX_SIZE).fill(false);

               data[idx] = checked;

               await RedisClient.set(CHECKBOX_KEY, JSON.stringify(data));

               await publisher.publish(
                    'InternalUpdate',
                    JSON.stringify({ idx, checked })
               );
          });

     });

     app.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, '../public/index.html'));
     });

     app.get('/init', async (req, res) => {
          const existingState = await RedisClient.get(CHECKBOX_KEY);

          if (existingState) {
               return res.json(JSON.parse(existingState));
          }

          const initialState = new Array(BOX_SIZE).fill(false);
          await RedisClient.set(CHECKBOX_KEY, JSON.stringify(initialState));

          res.json(initialState);
     });

     server.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
     });
}

main();