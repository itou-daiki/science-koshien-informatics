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

  // Teaching examples: stable descending order, then list scheduling with A/B/C tie-breaking.
  const scores=[2,0,2,1],sort=[],result=Array(4).fill(null),ends=[3,2,1];
  const sortSnap=(command,note,person=null,destination=null)=>sort.push({command,note,person,destination,result:[...result],ends:[...ends]});
  sortSnap('開始','得点の高い順に「人の番号」を並べます。同点なら元の順番を保ちます。');
  sortSnap('置き場所を準備','2点以上は2人、1点以上は3人、0点以上は4人。0始まりなので最後の位置は順に1・2・3です。');
  for(let person=3;person>=0;person--){
    const score=scores[person],destination=ends[score];
    sortSnap('読む・置き場所を選ぶ',`人${person}は${score}点。${score}点の次の置き場所は位置${destination}。右から人を読み、同点の人を右から埋めます。`,person,destination);
    result[destination]=person;
    sortSnap('人の番号を置く',`位置${destination}に人${person}を配置。入れるのは得点${score}ではなく、人の番号${person}です。`,person,destination);
    ends[score]--;
    sortSnap('置き場所を1つ左へ',`${score}点の置き場所を${destination}から${ends[score]}へ更新。次の同点の人は左へ。全員置けた得点は「配置済み」と表示します。`,person,destination);
  }
  sortSnap('完了','人0→人2→人3→人1（2・2・1・0点）。同じ2点の人0と人2は、元と同じ順番です。');
  const durations=[2,2,1,1,3],jobs=[],loads=[0,0,0],assigned=[[],[],[]],names=['A','B','C'];
  const jobSnap=(command,note,job=null,machine=null)=>jobs.push({command,note,job,machine,loads:[...loads],assigned:assigned.map(a=>[...a])});
  jobSnap('開始','左から順に仕事を読み、合計時間が最も短い機械へ入れます。同点ならA→B→Cの順に選びます。');
  durations.forEach((duration,job)=>{
    jobSnap('次の仕事を見る',`仕事${job+1}は${duration}分。追加する前のA・B・Cの合計時間を比べます。`,job);
    const minimum=Math.min(...loads),machine=loads.indexOf(minimum),ties=loads.filter(v=>v===minimum).length;
    jobSnap('最も空いた機械を選ぶ',`最小の合計は${minimum}分。${ties>1?'同点なのでA→B→Cの優先順で':''}${names[machine]}を選びます。追加後の値ではなく、今の合計で選びます。`,job,machine);
    const before=loads[machine];loads[machine]+=duration;assigned[machine].push(job);
    jobSnap('仕事を追加する',`${names[machine]}に${duration}分を追加。合計は${before}→${loads[machine]}分。他の機械は変わりません。`,job,machine);
  });
  jobSnap('完了','終了は最大の5分。この手順は必ず最短とは限りません。この例は3・3・3分に分ければ3分で終えられます。');

  const decimal=[
    {command:'開始：1÷6',note:'1は6より小さいので整数部分は0、余りは1。小数部分を1桁ずつ作ります。',remainder:1,digits:'',record:[],focus:'余り1'},
    {command:'余りの出た位置を記録',note:'余り1は初登場。これから作る小数第1位と対応させ、1→第1位と記録します。',remainder:1,digits:'',record:[[1,1]],focus:'記録'},
    {command:'余りを10倍する',note:'次の小数の位へ進むので、余り1を10倍して10にします。',remainder:1,digits:'',record:[[1,1]],working:'1 × 10 = 10',focus:'10倍'},
    {command:'商を1桁に、余りを次へ',note:'10 = 6×1 + 4。小数第1位は1、次の余りは4です。',remainder:4,digits:'1',record:[[1,1]],working:'10 ÷ 6 → 商1・余り4',focus:'商と余り'},
    {command:'新しい余りを記録',note:'余り4は初登場。次に作る小数第2位と対応させ、4→第2位を記録します。',remainder:4,digits:'1',record:[[1,1],[4,2]],focus:'記録'},
    {command:'余りを10倍する',note:'余り4を10倍して40にします。前の桁の1ではなく、余り4を使います。',remainder:4,digits:'1',record:[[1,1],[4,2]],working:'4 × 10 = 40',focus:'10倍'},
    {command:'次の1桁を求める',note:'40 = 6×6 + 4。小数第2位は6、次の余りは再び4です。',remainder:4,digits:'16',record:[[1,1],[4,2]],working:'40 ÷ 6 → 商6・余り4',focus:'商と余り'},
    {command:'同じ余りを発見',note:'余り4は第2位の前にも出ています。同じ余りなら次の計算も同じなので、第2位から6が繰り返します。',remainder:4,digits:'16',record:[[1,1],[4,2]],repeat:true,focus:'循環を判定'},
    {command:'循環が分かったので終了',note:'答えは0.1666…。「同じ桁」ではなく「同じ余り」が繰り返しの根拠です。余り0になった場合は有限小数として終了します。',remainder:4,digits:'16',record:[[1,1],[4,2]],repeat:true,focus:'終了'}
  ];
  const ring=[];
  const ringSnap=(command,note,path,direction,done=false)=>ring.push({command,note,path:[...path],direction,done});
  ringSnap('開始：駅5から駅1へ','練習用の6駅の環状線。1区間2分です。駅の数ではなく、隣へ移った回数を数えます。',[5],'順方向');
  ringSnap('順方向に1区間','5の次は0。(5+1)%6 = 0。%は割り算の余りです。番号が戻っても、移動は1区間です。',[5,0],'順方向');
  ringSnap('順方向で到着','0から1へ。合計2区間×2分＝4分です。出発駅を1区間と数えないことに注意。',[5,0,1],'順方向');
  ringSnap('出発駅に戻して比較','今度は逆方向を調べます。図を駅5へ戻し、逆方向の区間数を0から数え直します。',[5],'逆方向');
  const path=[5];for(const station of [4,3,2,1]){path.push(station);const n=path.length-1;ringSnap('逆方向に1区間',`${path[n-1]}から${station}へ。逆方向はここまで${n}区間、${n*2}分。${station===1?'駅1に到着しました。':'まだ目的の駅1ではありません。'}`,path,'逆方向');}
  ringSnap('2つの道を比較','順方向は2区間・4分、逆方向は4区間・8分。短い順方向を選びます。2+4=6で環状線1周分になります。',[5,0,1],'順方向',true);
  function ringDiagram(s){
    const point=n=>[120+76*Math.sin(n*Math.PI/3),95-76*Math.cos(n*Math.PI/3)];
    let lines='';for(let n=0;n<6;n++){const a=point(n),b=point((n+1)%6);lines+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ring-track"/>`;}
    for(let n=1;n<s.path.length;n++){const a=point(s.path[n-1]),b=point(s.path[n]);lines+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ring-travel"/>`;}
    return `<svg viewBox="0 0 240 190" role="img" aria-label="駅${s.path.at(-1)}にいます。経路${s.path.join('から')}">${lines}${Array.from({length:6},(_,n)=>{const [x,y]=point(n);return `<circle cx="${x}" cy="${y}" r="14" class="${n===s.path.at(-1)?'ring-now':'ring-station'}"/><text x="${x}" y="${y+5}" text-anchor="middle">${n}</text>`}).join('')}</svg>`;
  }
  const cellRow=(items,focus)=>'<div class="trace-cells">'+items.map((v,i)=>`<div class="${i===focus?'trace-focus':''}">${v}</div>`).join('')+'</div>';
  document.querySelectorAll('[data-step-demo]').forEach(host=>{
    const type=host.dataset.stepDemo,states=({stack,recursion,sort,jobs,decimal,ring})[type];let index=0;
    host.classList.add('step-demo');host.setAttribute('role','group');host.setAttribute('aria-label',({stack:'スタック',recursion:'再帰',sort:'並べ替え',jobs:'仕事の割り当て',decimal:'循環小数',ring:'環状線'})[type]+'を1手ずつ追う');
    host.innerHTML='<div class="step-stage"></div><div class="step-status" aria-live="polite" aria-atomic="true"></div><div class="step-controls"><button type="button" data-action="back">戻る</button><button type="button" data-action="next">次の1手 →</button><button type="button" data-action="reset">最初から</button><span class="step-count"></span></div>';
    function render(){
      const s=states[index];let diagram='';
      if(type==='stack'){
        diagram=`<div class="step-stack"><span>↑ 一番上から出し入れ</span><div class="step-pile">${s.values.map((v,i)=>`<b class="${s.focus===i?'step-changed':''}">${v}${s.focus===i?'<small>← 注目</small>':''}</b>`).reverse().join('')}</div><span>底</span></div><div class="step-work"><b>DUP＝上の数を複製</b><p>＋は「取り出す → 足す → 積む」の3段階に分けて表示。</p><strong>${s.temp||'取り出した数：なし'}</strong></div>`;
      }else if(type==='sort'){
        diagram=`<div class="trace-sort"><b>読む配列：人の得点（右から読む ←）</b>${cellRow(scores.map((v,i)=>`<small>人${i}</small><b>${v}点</b>`),s.person)}<b>結果：人の番号（高得点 → 低得点）</b>${cellRow(s.result.map((v,i)=>`<small>位置${i}</small><b>${v===null?'空き':'人'+v}</b>`),s.destination)}</div><div class="trace-map"><b>得点 → 次の置き場所</b>${[2,1,0].map(v=>`<div class="${s.person!==null&&scores[s.person]===v?'trace-focus':''}">${v}点 → ${scores.filter(x=>x===v).length===s.result.filter(x=>x!==null&&scores[x]===v).length?'配置済み':'位置'+s.ends[v]}</div>`).join('')}<small>初期位置＝その得点以上の人数−1<br>同点は元の順番を保つ</small></div>`;
      }else if(type==='jobs'){
        diagram=`<div class="trace-queue"><b>仕事を左から読む →</b>${cellRow(durations.map((v,i)=>`<small>仕事${i+1}</small><b>${v}分</b>`),s.job)}<p>黄色＝注目中の仕事・選んだ機械<br>同点はA→B→Cの順</p></div><div class="trace-machines">${names.map((name,i)=>`<div class="${i===s.machine?'trace-focus':''}"><b>${name}</b><div class="trace-bar">${s.assigned[i].map(j=>`<span style="width:${durations[j]*18}%">${durations[j]}</span>`).join('')}</div><strong>${s.loads[i]}分</strong></div>`).join('')}<small>棒の長さ＝合計時間（数字は分）</small></div>`;
      }else if(type==='decimal'){
        diagram=`<div class="decimal-work"><b>1 ÷ 6 の筆算</b><div class="decimal-answer">0.${s.repeat?'1<span>6</span>66…':s.digits||'□'}</div><div class="decimal-remainder">いまの余り：<b>${s.remainder}</b></div><p>${s.working||'余り → 10倍 → 6で割る'}</p></div><div class="decimal-record"><b>余り → 初めて出た位置</b>${s.record.length?s.record.map(([r,p])=>`<div class="${s.repeat&&r===4?'trace-focus':''}">余り${r} → 小数第${p}位の前</div>`).join(''):'<p>まだ記録なし</p>'}<small>${s.repeat?'黄色の6から循環。余り4が再登場。':'余りを10倍する前に記録'}</small><p><b>注目：${s.focus}</b></p></div>`;
      }else if(type==='ring'){
        diagram=`<div class="ring-visual">${ringDiagram(s)}</div><div class="ring-info"><b>6駅の例：駅5 → 駅1 ／ 1区間2分</b><p>黄色＝今いる駅、青線＝通った道</p><div>${s.direction}：${s.path.join(' → ')}</div><strong>${s.path.length-1}区間 × 2分 ＝ ${(s.path.length-1)*2}分</strong><p>${s.done?'比較：順方向4分 ＜ 逆方向8分':s.direction==='逆方向'?'順方向は4分でした。逆方向を確認中。':'5の次は0、0の次は1です。'}</p></div>`;
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
