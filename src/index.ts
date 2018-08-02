import * as express from 'express';

// http server
const app: any = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});