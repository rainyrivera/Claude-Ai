const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{
  const [f0,f1,out]=[+process.argv[2],+process.argv[3],process.argv[4]];const FPS=30;
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+process.cwd()+'/page.html');await p.evaluate(()=>document.fonts.ready);
  const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',''+FPS,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',''+FPS,out],{stdio:['pipe','inherit','inherit']});
  for(let f=f0;f<f1;f++){await p.evaluate(t=>frame(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('seg done',out);
})();
