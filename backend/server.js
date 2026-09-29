import 'dotenv/config';
import { createApp } from './src/app.js';

const port = Number(process.env.PORT) || 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`Daymark API listening on port ${port}`);
});
