import { Router } from "express";
import { postCheckout } from "../controllers/stripe.controller.js";

const r = Router();

r.post("/checkout", postCheckout);

export default r;