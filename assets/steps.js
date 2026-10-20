(() => {
  const stack = [
    {values:[3,5],command:'開始',note:'下から3、5。操作するのは一番上の5です。',focus:1},
    {values:[3,5,5],command:'DUP：上の数を複製',note:'一番上の5をもう1個積みました。底の3は変わりません。',focus:2},
    {values:[3],command:'＋：上の2個を取り出す',note:'5と5を取り出しました。3は底に残ります。',temp:'取り出した数：5 と 5'},
    {values:[3],command:'＋：取り出した数を足す',note:'5＋5＝10。まだスタックには戻していません。',temp:'計算結果：10'},
    {values:[3,10],command:'＋：和を積む',note:'10を積んで＋の命令が完了。下から[3, 10]になりました。',focus:1}
  ];
  const recursion=[]; let pegs={A:[2,1],B:[],C:[]},frames=[];
  const snap=(command,note,move=null)=>recursion.push({pegs:JSON.parse(JSON.stringify(pegs)),frames:frames.map(f=>({...f})),command,note,move});
  snap('開始','2枚をAからCへ移します。小さい円盤1を大きい円盤2の上に置いています。');
  function hanoi(n,from,to,via){
    frames.push({label:`${n}枚：${from}→${to}`,status:'実行中'});
    snap('呼び出す',`${n}枚を${from}から${to}へ移す仕事を開始。${n===1?'1枚なので、これ以上呼び出しません。':'まず上の1枚を退避させます。'}`);
    if(n>1){frames.at(-1).status='待機中';hanoi(n-1,from,via,to);frames.at(-1).status='実行中';snap('呼び出し元で再開','1枚の仕事から戻りました。2枚の仕事の続きで、大きい円盤を動かします。');}
    const disk=pegs[from].pop();pegs[to].push(disk);
    snap('円盤を1枚動かす',`円盤${disk}を${from}から${to}へ移しました。${n===1?'この1枚の仕事は終了できます。':'次は退避した小さい円盤を重ねます。'}`,{disk,from,to});
    if(n>1){frames.at(-1).status='待機中';hanoi(n-1,via,to,from);frames.at(-1).status='実行中';snap('呼び出し元で再開','小さい円盤もCに重なりました。2枚の仕事の残りは、終了することだけです。');}
    frames.pop();if(frames.length)frames.at(-1).status='再開待ち';snap('終了して戻る',frames.length?'1枚の仕事を終了。待っていた2枚の仕事の続きへ戻ります。':'2枚の仕事も終了。すべての円盤がCに移り、待っている仕事もありません。');
  }
  hanoi(2,'A','C','B');
  document.querySelectorAll('[data-step-demo]').forEach(host=>{
    const type=host.dataset.stepDemo,states=type==='stack'?stack:recursion;let index=0;
    host.classList.add('step-demo');host.setAttribute('role','group');host.setAttribute('aria-label',type==='stack'?'スタックを1手ずつ追う':'再帰を1手ずつ追う');
    host.innerHTML='<div class="step-stage"></div><div class="step-status" aria-live="polite" aria-atomic="true"></div><div class="step-controls"><button type="button" data-action="back">戻る</button><button type="button" data-action="next">次の1手 →</button><button type="button" data-action="reset">最初から</button><span class="step-count"></span></div>';
    function render(){
      const s=states[index];let diagram='';
      if(type==='stack'){
        diagram=`<div class="step-stack"><span>↑ 一番上から出し入れ</span><div class="step-pile">${s.values.map((v,i)=>`<b class="${s.focus===i?'step-changed':''}">${v}${s.focus===i?'<small>← 注目</small>':''}</b>`).reverse().join('')}</div><span>底</span></div><div class="step-work"><b>DUP＝上の数を複製</b><p>＋は「取り出す → 足す → 積む」の3段階に分けて表示。</p><strong>${s.temp||'取り出した数：なし'}</strong></div>`;
      }else{
        diagram=`<div class="step-towers">${Object.entries(s.pegs).map(([peg,disks])=>`<div><div class="step-peg">${[...disks].reverse().map(d=>`<b style="width:${d===1?50:85}%" class="${s.move?.disk===d&&s.move.to===peg?'step-changed':''}">${d}</b>`).join('')}</div><b>${peg}</b></div>`).join('')}<span>円盤：1が小、2が大${s.move?` ／ 今の移動：${s.move.from} → ${s.move.to}`:''}</span></div><div class="step-frames"><b>呼び出した仕事（再帰）</b>${s.frames.length?s.frames.map(f=>`<div class="${f.status==='実行中'?'step-current':''}">${f.label}<small>${f.status}</small></div>`).join(''):`<p>${index===0?'まだ仕事を呼び出していません':'すべての仕事が終了しました'}</p>`}</div>`;
      }
      host.querySelector('.step-stage').innerHTML=diagram;
      host.querySelector('.step-status').innerHTML=`<b>いま：${s.command}</b><span>${s.note}</span>`;
      host.querySelector('.step-count').textContent=`${index} / ${states.length-1} 手`;
      host.querySelector('[data-action="back"]').disabled=index===0;
      host.querySelector('[data-action="next"]').disabled=index===states.length-1;
      host.querySelector('[data-action="reset"]').disabled=index===0;
      host.dataset.step=String(index);
    }
    host.addEventListener('click',e=>{const button=e.target.closest('button[data-action]');if(!button)return;index=button.dataset.action==='reset'?0:Math.max(0,Math.min(states.length-1,index+(button.dataset.action==='next'?1:-1)));render()});
    render();
  });
})();
