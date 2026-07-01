/* Snake — real playable canvas game. Arrow keys + swipe. */
export const snake = {
  title:'🐍 נחש',
  sub:'אכלו את הנקודות. חצים או החלקה.',
  init(api){
    const {W,canvas} = api;
    this.g = 15; this.cells = Math.floor(W/this.g);
    this.snake = [{x:7,y:7}]; this.dir = {x:1,y:0}; this.food = {x:12,y:7};
    this.tick = 0; this.len = 3; this.canvas = canvas;
    this.key = (e)=>{
      const k=e.key;
      if(k==='ArrowUp'&&this.dir.y===0)    this.dir={x:0,y:-1};
      if(k==='ArrowDown'&&this.dir.y===0)  this.dir={x:0,y:1};
      if(k==='ArrowLeft'&&this.dir.x===0)  this.dir={x:-1,y:0};
      if(k==='ArrowRight'&&this.dir.x===0) this.dir={x:1,y:0};
      if(k.startsWith('Arrow')) e.preventDefault();
    };
    this.ts = null;
    this.tstart = (e)=>{ this.ts = {x:e.touches[0].clientX, y:e.touches[0].clientY}; };
    this.tend = (e)=>{
      if(!this.ts) return;
      const dx=e.changedTouches[0].clientX-this.ts.x, dy=e.changedTouches[0].clientY-this.ts.y;
      if(Math.abs(dx)>Math.abs(dy)){ if(dx>0&&this.dir.x===0)this.dir={x:1,y:0}; else if(dx<0&&this.dir.x===0)this.dir={x:-1,y:0}; }
      else{ if(dy>0&&this.dir.y===0)this.dir={x:0,y:1}; else if(dy<0&&this.dir.y===0)this.dir={x:0,y:-1}; }
    };
    window.addEventListener('keydown', this.key);
    canvas.addEventListener('touchstart', this.tstart, {passive:true});
    canvas.addEventListener('touchend', this.tend, {passive:true});
  },
  cleanup(){ window.removeEventListener('keydown', this.key); this.canvas.removeEventListener('touchstart', this.tstart); this.canvas.removeEventListener('touchend', this.tend); },
  step(api){
    this.tick++; if(this.tick % 8 !== 0) return;
    const h = { x:(this.snake[0].x+this.dir.x+this.cells)%this.cells, y:(this.snake[0].y+this.dir.y+this.cells)%this.cells };
    if(this.snake.some(s=>s.x===h.x&&s.y===h.y)){ this.snake=[{x:7,y:7}]; this.len=3; this.dir={x:1,y:0}; return; }
    this.snake.unshift(h);
    if(h.x===this.food.x && h.y===this.food.y){
      this.len++; api.addScore(3);
      this.food = { x:Math.floor(Math.random()*this.cells), y:Math.floor(Math.random()*this.cells) };
    }
    while(this.snake.length > this.len) this.snake.pop();
  },
  draw(api){
    const {ctx,W,H} = api;
    ctx.fillStyle='#0a1424'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e0a72e'; ctx.fillRect(this.food.x*this.g, this.food.y*this.g, this.g-1, this.g-1);
    this.snake.forEach((s,i)=>{ ctx.fillStyle = i===0 ? '#8fd0ff' : '#3e8f6b'; ctx.fillRect(s.x*this.g, s.y*this.g, this.g-1, this.g-1); });
  },
};
