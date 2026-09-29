import 'dotenv/config';
import { createApp } from './src/app.js';


const port = process.env.PORT || 4000;
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`Daymark API listening on port ${port}`);
});
