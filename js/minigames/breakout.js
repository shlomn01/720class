/* Breakout — real playable canvas game. Mouse + touch. */
export const breakout = {
  title:'🧱 שובר לבנים',
  sub:'הזיזו את המחבט. אל תיתנו לכדור ליפול!',
  init(api){
    const {W,H,canvas} = api;
    this.px=W/2-30; this.pw=60; this.bx=W/2; this.by=H-40; this.vx=2.4; this.vy=-2.4;
    this.bricks=[];
    for(let r=0;r<3;r++) for(let c=0;c<6;c++) this.bricks.push({x:8+c*48, y:20+r*20, alive:true});
    this.canvas=canvas; this._W=W; this._H=H;
    this.move=(e)=>{
      const rect=canvas.getBoundingClientRect();
      const x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
      this.px=Math.max(0, Math.min(W-this.pw, x*(W/rect.width)-this.pw/2));
    };
    canvas.addEventListener('mousemove', this.move);
    canvas.addEventListener('touchmove', this.move, {passive:true});
  },
  cleanup(){ this.canvas.removeEventListener('mousemove', this.move); this.canvas.removeEventListener('touchmove', this.move); },
  step(api){
    const {W,H}=api;
    this.bx+=this.vx; this.by+=this.vy;
    if(this.bx<6||this.bx>W-6) this.vx*=-1;
    if(this.by<6) this.vy*=-1;
    if(this.by>H-30 && this.by<H-22 && this.bx>this.px && this.bx<this.px+this.pw){ this.vy=-Math.abs(this.vy); api.addScore(1); }
    if(this.by>H){ this.bx=W/2; this.by=H-40; this.vy=-2.4; }
    this.bricks.forEach(b=>{
      if(b.alive && this.bx>b.x && this.bx<b.x+40 && this.by>b.y && this.by<b.y+14){ b.alive=false; this.vy*=-1; api.addScore(5); }
    });
    if(this.bricks.every(b=>!b.alive)) this.bricks.forEach(b=>b.alive=true);
  },
  draw(api){
    const {ctx,W,H}=api;
    ctx.fillStyle='#0a1424'; ctx.fillRect(0,0,W,H);
    this.bricks.forEach(b=>{ if(b.alive){ ctx.fillStyle='#e8873a'; ctx.fillRect(b.x,b.y,40,14); } });
    ctx.fillStyle='#8fd0ff'; ctx.fillRect(this.px,H-28,this.pw,8);
    ctx.beginPath(); ctx.arc(this.bx,this.by,5,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
  },
};
