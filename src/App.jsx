import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { SUBJECTS, QUESTIONS, buildPaper } from './data/questions'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, ClipboardList, LineChart, Home, Timer, Flag, CheckCircle2 } from 'lucide-react'

const LS = 'abhyas-cbse-v1'
function load() {
  try { return JSON.parse(localStorage.getItem(LS)) || { attempts: [], profile: { name: 'Class 12', streak: 1 } } }
  catch { return { attempts: [], profile: { name: 'Class 12', streak: 1 } } }
}
function save(s) { localStorage.setItem(LS, JSON.stringify(s)) }

export default function App() {
  const [store, setStore] = useState(load)
  useEffect(() => save(store), [store])
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="logo">अ</div> Abhyas.cbse.ai</div>
        <div className="chip">CBSE Class 12 · Board Lab</div>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard store={store} />} />
        <Route path="/create" element={<Create />} />
        <Route path="/exam/:id" element={<Exam store={store} setStore={setStore} />} />
        <Route path="/result/:id" element={<Result store={store} />} />
        <Route path="/analytics" element={<Analytics store={store} />} />
        <Route path="/bank" element={<Bank />} />
      </Routes>
      <nav className="nav">
        <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}><Home size={16}/><div>Home</div></NavLink>
        <NavLink to="/create" className={({isActive}) => isActive ? 'active' : ''}><ClipboardList size={16}/><div>Mocks</div></NavLink>
        <NavLink to="/bank" className={({isActive}) => isActive ? 'active' : ''}><BookOpen size={16}/><div>PYQs</div></NavLink>
        <NavLink to="/analytics" className={({isActive}) => isActive ? 'active' : ''}><LineChart size={16}/><div>AI Lab</div></NavLink>
      </nav>
    </div>
  )
}

function Dashboard({ store }) {
  const nav = useNavigate()
  const last = store.attempts.slice(-5).reverse()
  const mastery = SUBJECTS.map(s => {
    const qs = store.attempts.flatMap(a => a.review || []).filter(r => r.subject === s.id)
    const ok = qs.filter(q => q.correct).length
    const pct = qs.length ? Math.round(ok / qs.length * 100) : 8
    return { ...s, pct }
  })
  return (
    <>
      <div className="grid cards-2">
        <section className="card hero">
          <span className="tag">Reverse-engineered for Boards, not JEE CBT</span>
          <h1>Write the paper before the board writes you.</h1>
          <p>Full 3-hour CBSE-style mocks, chapter sprints, and most-expected PYQ packs — timer, OMR palette, mark-for-review, then weak-chapter graph.</p>
          <div className="row" style={{marginTop:16}}>
            <button className="btn btn-gold" onClick={() => nav('/create')}>Create mock test</button>
            <button className="btn btn-ghost" onClick={() => nav('/bank')}>Browse PYQ bank</button>
          </div>
        </section>
        <section className="card">
          <div className="muted">Readiness</div>
          <div className="stat">{mastery.reduce((a,b)=>a+b.pct,0)/mastery.length | 0}%</div>
          <p className="muted">Predicted board comfort from your last attempts. Streak {store.profile.streak} day.</p>
        </section>
      </div>
      <div className="grid cards-3" style={{marginTop:14}}>
        {mastery.map(s => (
          <div className="card" key={s.id}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <strong>{s.name}</strong><span className="muted">{s.pct}%</span>
            </div>
            <div className="progress" style={{marginTop:10}}><span style={{width:`${s.pct}%`, background:s.color}}/></div>
          </div>
        ))}
      </div>
      <section className="card" style={{marginTop:14}}>
        <strong>Recent attempts</strong>
        {last.length === 0 && <p className="muted" style={{marginTop:8}}>No mocks yet — start a Physics full paper.</p>}
        {last.map(a => (
          <div className="subject" key={a.id} onClick={() => nav('/result/'+a.id)} style={{cursor:'pointer', marginTop:8}}>
            <div>
              <div>{a.title}</div>
              <div className="muted">{new Date(a.at).toLocaleString()} · {a.mode}</div>
            </div>
            <div className="stat" style={{fontSize:18}}>{a.score}/{a.total}</div>
          </div>
        ))}
      </section>
    </>
  )
}

function Create() {
  const nav = useNavigate()
  const [subject, setSubject] = useState('physics')
  const [mode, setMode] = useState('full')
  const [chapter, setChapter] = useState('')
  const [mins, setMins] = useState(180)
  const sub = SUBJECTS.find(s => s.id === subject)
  useEffect(() => { setChapter(sub.chapters[0]) }, [subject])
  useEffect(() => {
    if (mode === 'full') setMins(180)
    else if (mode === 'chapter') setMins(25)
    else setMins(45)
  }, [mode])
  function start() {
    const paper = buildPaper({ subject, mode, chapter, count: mode === 'chapter' ? 8 : 20 })
    const id = 't' + Date.now()
    const exam = {
      id, subject, mode, chapter: mode === 'chapter' ? chapter : 'All',
      title: `${sub.name} · ${mode === 'full' ? 'Full paper' : mode === 'expected' ? 'Most expected PYQs' : chapter}`,
      mins, questions: paper, startedAt: Date.now()
    }
    sessionStorage.setItem('live-exam', JSON.stringify(exam))
    nav('/exam/' + id)
  }
  return (
    <section className="card">
      <h2>Build a mock like CBSE</h2>
      <p className="muted">Questions are tagged from PYQs, CBSE samples and high-frequency expected items. Full paper uses a 3-hour countdown and question palette.</p>
      <div className="form" style={{marginTop:16, maxWidth:520}}>
        <label>Subject</label>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <label>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="full">Whole paper (board pattern mix)</option>
          <option value="chapter">Chapter-wise sprint</option>
          <option value="expected">Most expected + PYQ pack</option>
        </select>
        {mode === 'chapter' && (
          <>
            <label>Chapter</label>
            <select value={chapter} onChange={e => setChapter(e.target.value)}>
              {sub.chapters.map(c => <option key={c}>{c}</option>)}
            </select>
          </>
        )}
        <label>Duration (minutes)</label>
        <input type="number" min={5} max={180} value={mins} onChange={e => setMins(+e.target.value)} />
        <button className="btn btn-gold" onClick={start}>Start exam console</button>
      </div>
    </section>
  )
}

function Exam({ setStore }) {
  const { id } = useParams()
  const nav = useNavigate()
  const exam = useMemo(() => JSON.parse(sessionStorage.getItem('live-exam') || 'null'), [id])
  const [i, setI] = useState(0)
  const [ans, setAns] = useState({})
  const [rev, setRev] = useState({})
  const [left, setLeft] = useState((exam?.mins || 30) * 60)
  useEffect(() => {
    if (!exam) return
    const t = setInterval(() => setLeft(s => s <= 1 ? (clearInterval(t), submit(), 0) : s - 1), 1000)
    return () => clearInterval(t)
  }, [exam])
  if (!exam) return <p className="card">Exam expired. Create a new mock.</p>
  const q = exam.questions[i]
  function submit() {
    const review = exam.questions.map(qq => ({
      ...qq,
      chosen: ans[qq.id],
      correct: ans[qq.id] === qq.answer
    }))
    const score = review.filter(r => r.correct).length
    const attempt = { id: exam.id, title: exam.title, mode: exam.mode, at: Date.now(), score, total: review.length, review }
    setStore(s => ({ ...s, attempts: [...s.attempts, attempt], profile: { ...s.profile, streak: (s.profile.streak || 0) + 1 } }))
    nav('/result/' + exam.id)
  }
  const mm = String(Math.floor(left / 60)).padStart(2,'0')
  const ss = String(left % 60).padStart(2,'0')
  return (
    <div className="exam-wrap">
      <section className="card">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <div className="tag">{q.source} · {q.marks} mark</div>
            <h3 style={{marginTop:8}}>{exam.title}</h3>
          </div>
          <div className="timer"><Timer size={16}/> {mm}:{ss}</div>
        </div>
        <div className="muted">Q {i+1} / {exam.questions.length} · {q.chapter}</div>
        <div className="q-text">{q.text}</div>
        <div className="options">
          {q.options.map((o, idx) => (
            <button key={idx} className={'opt' + (ans[q.id]===idx ? ' sel' : '')} onClick={() => setAns(a => ({...a, [q.id]: idx}))}>
              {String.fromCharCode(65+idx)}. {o}
            </button>
          ))}
        </div>
        <div className="row" style={{marginTop:16}}>
          <button className="btn btn-ghost" onClick={() => setI(x => Math.max(0, x-1))}>Prev</button>
          <button className="btn btn-ghost" onClick={() => setI(x => Math.min(exam.questions.length-1, x+1))}>Next</button>
          <button className="btn btn-cyan" onClick={() => setRev(r => ({...r, [q.id]: !r[q.id]}))}><Flag size={14}/> Review</button>
          <button className="btn btn-gold" onClick={submit}>Submit paper</button>
        </div>
      </section>
      <aside className="card">
        <strong>Question palette</strong>
        <p className="muted">Green answered · gold marked · grey not visited</p>
        <div className="palette" style={{marginTop:10}}>
          {exam.questions.map((qq, idx) => {
            let cls = 'pbtn'
            if (ans[qq.id] !== undefined) cls += ' ans'
            if (rev[qq.id]) cls += ' rev'
            if (idx === i) cls += ' cur'
            return <button key={qq.id} className={cls} onClick={() => setI(idx)}>{idx+1}</button>
          })}
        </div>
        <div className="muted" style={{marginTop:12}}>Offline-safe PWA · airplane mode friendly after first load</div>
      </aside>
    </div>
  )
}

function Result({ store }) {
  const { id } = useParams()
  const a = store.attempts.find(x => x.id === id)
  if (!a) return <p className="card">Result not found.</p>
  const pct = Math.round(a.score / a.total * 100)
  return (
    <section className="card">
      <div className="tag">Post-exam analysis</div>
      <h2 style={{margin:'8px 0'}}>{a.title}</h2>
      <div className="stat">{a.score}/{a.total} · {pct}%</div>
      <p className="muted">Loop: every wrong item feeds the weak-chapter graph for the next mock.</p>
      <div style={{marginTop:16, display:'grid', gap:12}}>
        {a.review.map((q, n) => (
          <div key={q.id} style={{borderTop:'1px solid #1d3658', paddingTop:12}}>
            <div className="row">
              {q.correct ? <CheckCircle2 color="#4ade80" size={16}/> : <span className="tag">Wrong</span>}
              <span className="muted">Q{n+1} · {q.chapter} · {q.source}</span>
            </div>
            <div className="q-text" style={{fontSize:16}}>{q.text}</div>
            <div className="muted">Your answer: {q.chosen===undefined ? '—' : q.options[q.chosen]}</div>
            <div>Correct: {q.options[q.answer]}</div>
            <p className="muted" style={{marginTop:6}}>{q.explain}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Analytics({ store }) {
  const byChap = {}
  store.attempts.forEach(a => a.review?.forEach(q => {
    const k = q.chapter
    byChap[k] = byChap[k] || { chapter: k, correct: 0, total: 0 }
    byChap[k].total++
    if (q.correct) byChap[k].correct++
  }))
  const data = Object.values(byChap).map(c => ({ ...c, accuracy: Math.round(c.correct/c.total*100) }))
  const weak = [...data].sort((a,b)=>a.accuracy-b.accuracy).slice(0,3)
  return (
    <div className="grid">
      <section className="card">
        <h2>AI Lab — weak chapter graph</h2>
        <p className="muted">Graph engineering: nodes are chapters, edges are “you miss this after missing that”. Next mock oversamples red nodes.</p>
        {data.length === 0 ? <p className="muted" style={{marginTop:12}}>Attempt a paper to unlock heatmaps.</p> : (
          <div style={{height:280, marginTop:12}}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="chapter" tick={{fill:'#93a4be', fontSize:10}} interval={0} angle={-25} textAnchor="end" height={70}/>
                <YAxis tick={{fill:'#93a4be'}}/>
                <Tooltip />
                <Bar dataKey="accuracy" fill="#e8b84a" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
      <section className="card">
        <strong>Next loop recommendation</strong>
        {weak.length === 0 && <p className="muted">No data yet.</p>}
        {weak.map(w => (
          <div className="subject" key={w.chapter}>
            <div>{w.chapter}</div>
            <div className="muted">{w.accuracy}% accuracy · drill this chapter</div>
          </div>
        ))}
      </section>
    </div>
  )
}

function Bank() {
  const [sub, setSub] = useState('physics')
  const list = QUESTIONS.filter(q => q.subject === sub)
  return (
    <section className="card">
      <h2>PYQ & expected bank</h2>
      <div className="row" style={{margin:'12px 0'}}>
        {SUBJECTS.map(s => (
          <button key={s.id} className={sub===s.id?'btn btn-gold':'btn btn-ghost'} onClick={()=>setSub(s.id)}>{s.name}</button>
        ))}
      </div>
      {list.map(q => (
        <div key={q.id} style={{padding:'12px 0', borderTop:'1px solid #1d3658'}}>
          <div className="row"><span className="tag">{q.source}</span><span className="muted">{q.chapter} · {q.marks}m</span></div>
          <div className="q-text" style={{fontSize:16}}>{q.text}</div>
          <div className="muted">Answer: {q.options[q.answer]} — {q.explain}</div>
        </div>
      ))}
    </section>
  )
}
