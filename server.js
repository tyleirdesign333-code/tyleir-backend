const express = require("express");
const stripe = require("stripe")("sk_test_sk_live_51SXvqP3WwxnpMbYnm55CnAajxA04EF5JZalGH9FRGWp9fItWEY33uVOAFoqv6CsnX0971ABuW1fNdgeed2T6GhuP00q1RezsOh"); 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
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-one-click-session", async (req, res) => {
  try {
    const { cart, email } = req.body;

    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined
        },
        unit_amount: item.price
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer: customer.id,
      payment_intent_data: { setup_future_usage: "off_session" },
      success_url: "https://tyleirdesign333-code.github.io/tyleir-cart/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://tyleirdesign333-code.github.io/tyleir-cart/cancel.html"
    });

    res.json({ id: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
