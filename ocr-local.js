'use strict';

const app = require('./express/ocr');

//Start up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`This is port ${PORT}`));