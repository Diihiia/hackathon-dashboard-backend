import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import teamsRoutes from './app/routes/teams.js';
import usersRoutes from './app/routes/users.js';
import ConnectDB from './db_init.js';

const app = express();

ConnectDB();
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev')); //to log request information
// simple route
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if(req.method === 'OPTIONS')
  {
    res.header('Access-Control-Allow-Methods', 'PUT, DELETE, GET, PATCH, POST');
    return res.status(200).json({});
  }
  next(); //to be able to use the other routes, otherwise we'll just be stuck here
});
app.use('/teams',teamsRoutes);
app.use('/users',usersRoutes);
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => { //this one is useless, remove it when you're done
    res.status(error.status|| 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
// set port, listen for requests
const PORT = process.env.PORT || 8080 || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
