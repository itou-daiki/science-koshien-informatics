// Keep shared deep links to the former slide-only homepage usable.
function preserveLegacyLink(){
  const legacy = location.hash.match(/^#slide-(\d+)$/);
  if (legacy && Number(legacy[1]) > 1) location.replace('overview.html' + location.hash);
  else if (legacy) history.replaceState(null, '', location.pathname + location.search);
}
preserveLegacyLink();
window.addEventListener('hashchange', preserveLegacyLink);
const states = [
  {values:[4],title:'開始：4が1個',description:'まず、一番上の数を複製します。',button:'DUP：複製する →'},
  {values:[4,4],title:'DUPの後：4が2個',description:'上の2個を取り出し、足した数を積みます。',button:'＋：足す →'},
  {values:[8],title:'完了：8が1個',description:'DUP → ＋の2命令で、4を2倍にできました。',button:'もう一度試す ↺'}
];
let current=0;
function render(){const s=states[current];document.getElementById('stack').replaceChildren(...s.values.map(value=>{const block=document.createElement('div');block.className='block';block.textContent=value;return block;}));document.getElementById('step-title').textContent=s.title;document.getElementById('step-description').textContent=s.description;document.getElementById('step').textContent=s.button;}
document.getElementById('step').addEventListener('click',()=>{current=(current+1)%states.length;render();});
document.getElementById('reset').addEventListener('click',()=>{current=0;render();});
