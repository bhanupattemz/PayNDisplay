const Express = require("express")
const app = Express()

const Razorpay = require("razorpay");
const crypto = require("crypto")
const mongoose = require("mongoose")
const MemberModel = require("./members")
const path = require("path")
require("dotenv").config()
app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))



app.post("/api/v1/create-order", async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: amount * 100,
            currency,
            receipt,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Order creation failed", error });
    }
});

app.post("/api/v1/order/validate", async (req, res) => {
    const { data, memberData } = req.body
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    sha.update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
    const digest = sha.digest('hex')
    if (digest !== data.razorpay_signature) {
        res.status(400).json({ success: false })
    }
    let newMember = {
        playerId: memberData.player || "Nothing",
        content: memberData.content || "same Content",
        transactionId: data.razorpay_payment_id
    }
    newMember = new MemberModel(newMember)
    await newMember.save()
    const members = await MemberModel.find({})
    res.status(200).json({
        success: true,
        members
    })
})

app.use("api/v1/:no", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use(Express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});


app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`server is running of port ${process.env.PORT}`)
        mongoose.connect(process.env.DB_URL)
            .then(() => {
                console.log("Monngo DB connect success")
            }).catch((err) => {
                console.log(err)
            })
    }
})