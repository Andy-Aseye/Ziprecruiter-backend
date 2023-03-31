import * as yup from "yup";
import { Request, Response, NextFunction } from "express";

const validate =
  (schema: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
      return;
    } catch (err: any) {
      return res.status(400).json({ type: err.name, message: err.message });
    }
  };

export default validate;
