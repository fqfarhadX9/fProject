require('dotenv').config()
const connectDB = require("./db/index.js")

connectDB().
then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server Started at PORT: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MOngoDb Connection Failed!", error);
})