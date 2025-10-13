export default async function(req,res){
  res.statusCode=200; res.setHeader('content-type','text/plain'); res.end('echo-ok');
}
