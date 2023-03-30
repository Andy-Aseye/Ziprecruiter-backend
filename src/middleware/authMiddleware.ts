import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import config from "./config";


interface UserPayload {
    id: string;
    email: string;
    type?: string;
  }
  
  declare global {
    namespace Express {
      interface Request {
        user?: UserPayload;
      }
    }
  }

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // const authHeader = req.headers.authorization;
    const tokenBearer = req.headers.authorization as string;
    
    const token = tokenBearer.split(" ")[1];
    console.log(token);

    if(!tokenBearer) {
        return res.status(401).send('Missing authorization token')
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log(decoded);

        if (typeof decoded === "string") {
            throw new Error("Invalid JWT payload");
          }
      
          const userPayload: UserPayload = {
            id: decoded._id,
            email: decoded.email,
            type: decoded.type,
          };

          console.log(userPayload);

        req.user = userPayload;
        // console.log(req.user)
        next();
    } catch(err) {
      console.log(err);
      return res.status(403).send('Invalid authorization token');
    }
}

