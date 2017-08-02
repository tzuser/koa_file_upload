const logger = require('koa-logger');//日志
const serve = require('koa-static');//静态文件处理
const koaBody = require('koa-body');
const cors = require('koa-cors'); //跨域配置
const Koa = require('koa2');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = new Koa();
// log requests
app.use(cors());  
app.use(logger());

app.use(koaBody({ multipart: true }));

// custom 404

app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});

// serve files from ./public
app.use(serve(path.join(__dirname, '/public')));

// handle uploads
app.use(async function(ctx, next) {
  // ignore non-POSTs
  if ('POST' != ctx.method) return await next();

  const file = ctx.request.body.files.file;
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(path.join('./file/', file.name));
  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);
  ctx.redirect('/');
});

// listen

app.listen(3000);
console.log('listening on port 3000');