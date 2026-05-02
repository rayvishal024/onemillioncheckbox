import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";

export const authMiddleware = async (socket, next) => {
     try {
          //  extract token from handshake
          const token = socket.handshake.auth?.token;

          if (!token) {
               console.log("NO TOKEN");
               socket.user = null;
               return next();
          }

          //  decode token to get kid
          const decoded = jwt.decode(token, { complete: true });

          // fetch JWKs and find matching key
          const kid = decoded?.header?.kid;

          const res = await axios.get(
               "https://auth.rayvishal.dev/oauth/.well-known/jwks.json"
          );

          const jwk = res.data.keys.find(k => k.kid === kid);

          if (!jwk) {
               console.log("NO MATCHING JWK");
               socket.user = null;
               return next();
          }

          // convert JWK to PEM and verify token
          const publicKey = jwkToPem(jwk);

          const user = jwt.verify(token, publicKey);

          // attach user info to socket
          socket.user = user;

          next();

     } catch (err) {
         
          socket.user = null;
          next();
     }
}