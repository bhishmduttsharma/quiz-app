import exprss from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import resultRouter from './routes/resultRoutes.js';


const app = exprss();
const port = 4000;

//middleware
app.use(cors());
app.use(exprss.json());
app.use(exprss.urlencoded({ extended: true }));

//db
connectDB();

//routrs
app.use('/api/auth', userRouter);
app.use('/api/results', resultRouter);

app.get('/', (req,res) => {
    res.send('API WORKING');   
});


app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
})