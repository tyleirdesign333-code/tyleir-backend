import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// LOCKED PRODUCTS (SERVER-SIDE)
const PRICE_MAP = {
  "price_XXXXXXXX": true,
  "price_YYYYYYYY": true
};

app.post("/create-checkout-session", async (req, res) => {
  try {
    const line_items = req.body.cart.map(item => {
      if (!PRICE_MAP[item.priceId]) throw new Error("Invalid price");

      return {
        price: item.priceId,
        quantity: item.qty,
        adjustable_quantity: { enabled: false }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "https://tyleirdesign333-code.github.io/tyleir-cart/success.html",
      cancel_url: "https://tyleirdesign333-code.github.io/tyleir-cart/index.html",
      shipping_address_collection: { allowed_countries: ["US"] }
    });

    res.json({ sessionId: session.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(4242);
