/* Falling Blocks — catch the blocks with the paddle. Mouse + touch. */
export const blocks = {
  title:'🟪 בלוקים נופלים',
  sub:'הזיזו את התפסן לתפוס את הבלוקים.',
  init(api){
    const {W,canvas} = api;
    this.px = W/2-25; this.pw = 50; this.items = []; this.spawn = 0; this.canvas = canvas;
    this.move = (e)=>{
      const rect=canvas.getBoundingClientRect();
      const x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
      this.px=Math.max(0, Math.min(W-this.pw, x*(W/rect.width)-this.pw/2));
    };
    canvas.addEventListener('mousemove', this.move);
    canvas.addEventListener('touchmove', this.move, {passive:true});
  },
  cleanup(){ this.canvas.removeEventListener('mousemove', this.move); this.canvas.removeEventListener('touchmove', this.move); },
  step(api){
    const {W,H} = api;
    this.spawn++;
    if(this.spawn % 45 === 0) this.items.push({ x:Math.random()*(W-20), y:-20, v:2+Math.random()*1.5 });
    this.items.forEach(it=> it.y += it.v);
    this.items = this.items.filter(it=>{
      if(it.y>H-30 && it.y<H-18 && it.x+10>this.px && it.x+10<this.px+this.pw){ api.addScore(4); return false; }
      return it.y < H;
    });
  },
  draw(api){
    const {ctx,W,H} = api;
    ctx.fillStyle='#0a1424'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#c9518c'; this.items.forEach(it=> ctx.fillRect(it.x, it.y, 20, 20));
    ctx.fillStyle='#8fd0ff'; ctx.fillRect(this.px, H-24, this.pw, 8);
  },
};
