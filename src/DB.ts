import dotenv from "dotenv";
import mongoose, {ConnectOptions} from "mongoose";

dotenv.config();
const DBstring = process.env.DB as string;


mongoose.connect(DBstring,
     {useNewUrlparser: true} as ConnectOptions)
.then(() => console.log('connected to mongodb'))
.catch(err => console.log(err))

mongoose.connection.on('error', (err: Error) => {
  console.log(err);
})
