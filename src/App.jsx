import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-course-pulse-v2';

// Fictional teaching records for the self-contained UI/UX exercise.
// Staff names and course descriptions are examples, not GUC historical records.
const COURSE_CATALOG = {
  CSEN701: {
    name: 'Advanced Computer Lab',
    description: 'A project-focused course emphasizing teamwork, planning, software development, and delivery across several milestones.',
    history: [
      {year: '2025/26', instructors: ['Dr. Mariam Farouk'], tas: ['Yara Hassan', 'Omar Fawzy']},
      {year: '2024/25', instructors: ['Dr. Karim Nabil'], tas: ['Nour Adel', 'Mina Sameh']},
    ],
  },
  MATH204: {
    name: 'Linear Algebra',
    description: 'Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.',
    history: [
      {year: '2025/26', instructors: ['Dr. Salma Younis'], tas: ['Layla Maher', 'Ahmed Sherif']},
      {year: '2024/25', instructors: ['Dr. Rana Hamdy'], tas: ['Youssef Tarek', 'Dina Mourad']},
    ],
  },
  CSEN401: {
    name: 'Software Engineering',
    description: 'Software requirements, architecture, implementation practices, testing, and collaborative development.',
    history: [
      {year: '2025/26', instructors: ['Dr. Tamer Elsayed'], tas: ['Rana Fathy', 'Adham Khalil']},
      {year: '2024/25', instructors: ['Dr. Hala Mansour'], tas: ['Malak Samir', 'Ali Mahmoud']},
    ],
  },
  HUMA101: {
    name: 'Critical Thinking & Communication',
    description: 'A discussion-based course about assessing arguments, presenting ideas, and communicating effectively.',
    history: [
      {year: '2025/26', instructors: ['Dr. Dina Saad'], tas: ['Mariam Hossam', 'Youssef Nader']},
      {year: '2024/25', instructors: ['Dr. Reem Taha'], tas: ['Farah Amr', 'Sara Magdy']},
    ],
  },
  CSEN202: {
    name: 'Data Structures',
    description: 'Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.',
    history: [
      {year: '2025/26', instructors: ['Dr. Amina Rashed'], tas: ['Rami Elshamy', 'Nada Wael']},
      {year: '2024/25', instructors: ['Dr. Yasser Salem'], tas: ['Hana Ehab', 'Bassel Mostafa']},
    ],
  },
};
const getCourse = code => COURSE_CATALOG[code?.toUpperCase()] || {
  name: 'Course details not yet added',
  description: 'This course does not have a profile in the example catalog.',
  history: [],
};
// Pages: #/ (overview), #/reviews, #/my-reviews, #/courses/CODE
const readRoute = () => {
  const hash = window.location.hash;
  const match = hash.match(/^#\/courses\/([^/?#]+)$/);
  if(match) return {page:'course', code:decodeURIComponent(match[1]).toUpperCase()};
  if(hash==='#/reviews') return {page:'reviews'};
  if(hash==='#/my-reviews') return {page:'mine'};
  return {page:'overview'};
};
const PAGE_HASH = {overview:'#/', reviews:'#/reviews', mine:'#/my-reviews'};
const seed = [
  {id:'r1',courseCode:'CSEN701',rating:4,comment:'A challenging team project. The weekly milestones helped.',owner:'you',name:'You',date:'2026-10-06'},
  {id:'r2',courseCode:'CSEN701',rating:5,comment:'You learn the most when your group communicates well.',owner:'other',name:'Farida',date:'2026-10-02'},
  {id:'r3',courseCode:'MATH204',rating:3,comment:'Useful material but the pace felt fast.',owner:'other',name:'Karim',date:'2026-09-28'},
  {id:'r4',courseCode:'CSEN401',rating:4,comment:'Tutorial exercises are very important.',owner:'you',name:'You',date:'2026-09-24'},
  {id:'r5',courseCode:'HUMA101',rating:5,comment:'Well organized and approachable.',owner:'other',name:'Mariam',date:'2026-09-21'},
  {id:'r6',courseCode:'CSEN701',rating:3,comment:'Good practical work, but demanding during exam week.',owner:'other',name:'Youssef',date:'2026-09-15'},
  {id:'r7',courseCode:'MATH204',rating:5,comment:'Excellent explanation of difficult concepts.',owner:'other',name:'Nadine',date:'2026-08-30'},
  {id:'r8',courseCode:'CSEN401',rating:2,comment:'More worked examples in lectures would help.',owner:'other',name:'Adam',date:'2026-08-17'},
  {id:'r9',courseCode:'CSEN202',rating:4,comment:'The assignments strengthened problem-solving skills.',owner:'other',name:'Hassan',date:'2026-08-09'},
];
function getSaved(){try {let s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}
const avg = a => a.length?(a.reduce((s,r)=>s+r.rating,0)/a.length).toFixed(1):'—';
const fmtDate = d => d?new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
const RATING_LABELS = ['','Poor','Fair','Good','Very good','Excellent'];
const stars = n => '★'.repeat(n)+'☆'.repeat(Math.max(0,5-n));
export default function App(){
 const [reviews,setReviews] = useState(getSaved);
 const [search,setSearch] = useState('');
 const [rating,setRating] = useState('all');
 const [course,setCourse] = useState('CSEN701');
 const [editor,setEditor] = useState(null);
 const [error,setError] = useState('');
 const [notice,setNotice] = useState('');
 const [route,setRoute] = useState(readRoute);
 const page = route.page;
 const activeCourseCode = page==='course' ? route.code : null;
 const mineOnly = page==='mine';
 useEffect(()=>{
  const changePage = () => {setRoute(readRoute());window.scrollTo({top:0,behavior:'instant'});};
  window.addEventListener('hashchange',changePage);
  return ()=>window.removeEventListener('hashchange',changePage);
 },[]);
 const openCourse = code => {window.location.hash=`#/courses/${encodeURIComponent(code)}`;};
 const navigateTo = where => {
  if(window.location.hash===PAGE_HASH[where])window.scrollTo({top:0,behavior:'smooth'});
  else window.location.hash=PAGE_HASH[where];
 };
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(reviews)),[reviews]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4000);return ()=>clearTimeout(t);},[notice]);
 const editorOpen = !!editor;
 useEffect(()=>{if(!editorOpen)return;const onKey=e=>{if(e.key==='Escape')setEditor(null);};window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);},[editorOpen]);
 const result = useMemo(()=>reviews.filter(r=>(!mineOnly||r.owner==='you')&&(rating==='all'||r.rating===Number(rating))&&`${r.courseCode} ${r.comment} ${r.name}`.toLowerCase().includes(search.toLowerCase())),[reviews,search,rating,mineOnly]);
 const selected = reviews.filter(x=>x.courseCode.toUpperCase()===course.trim().toUpperCase());
 const uniqueCourses = [...new Set(reviews.map(x=>x.courseCode))];
 const distribution = [5,4,3,2,1].map(n=>({n,total:reviews.filter(r=>r.rating===n).length}));
 function openEditor(r,presetCode=''){if(r&&r.owner!=='you')return;setError('');setEditor({id:r?.id||null, courseCode:r?.courseCode||presetCode,rating:String(r?.rating||''),comment:r?.comment||''});}
 function submit(e){e.preventDefault();if(!editor.courseCode.trim()){setError('Enter a course code.');return;}if(!/^[1-5]$/.test(editor.rating)){setError('Rating must be from 1 to 5.');return;}if(reviews.some(r=>r.id!==editor.id&&r.owner==='you'&&r.courseCode.toLowerCase()===editor.courseCode.trim().toLowerCase())){setError('You have already reviewed this course.');return;}
 const payload={courseCode:editor.courseCode.trim().toUpperCase(),rating:Number(editor.rating),comment:editor.comment.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
 if(editor.id){setReviews(reviews.map(r=>r.id===editor.id?{...r,...payload}:r));setNotice('Review updated.');}else{setReviews([{...payload,id:'r-'+Date.now()},...reviews]);setNotice('Review posted.');}
 setEditor(null);
 }
 const dupReview = editor&&error.startsWith('You have already')&&reviews.find(r=>r.id!==editor.id&&r.owner==='you'&&r.courseCode.toLowerCase()===editor.courseCode.trim().toLowerCase());
 function reset(){setReviews(seed);setSearch('');setRating('all');setCourse('CSEN701');setEditor(null);setNotice('Example data restored.');}
 return <div className="review-app">
  <aside className="sidebar"><div className="logo"><span>✦</span> course<span>pulse</span></div><div className="side-caption">WORKSPACE</div><button title="Overview" className={page==='overview'?'active':''} aria-current={page==='overview'?'page':undefined} onClick={()=>navigateTo('overview')}><span>▦</span> Overview</button><button title="Browse reviews" className={page==='reviews'?'active':''} aria-current={page==='reviews'?'page':undefined} onClick={()=>navigateTo('reviews')}><span>≡</span> Browse reviews</button><button title="Write a review" onClick={()=>openEditor(null)}><span>＋</span> Write a review</button><div className="side-caption gap">YOUR SPACE</div><button title="Your reviews" className={page==='mine'?'active':''} aria-current={page==='mine'?'page':undefined} onClick={()=>navigateTo('mine')}><span>♡</span> Your reviews</button><div className="side-end"><div className="badge-face">Y</div><div><strong>Your account</strong><small>Student profile</small></div></div></aside>
  <main className="content">{notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss message">✕</button></div>}{activeCourseCode ? (
    <section className="course-detail-page">
      <button type="button" className="back-to-reviews" onClick={()=>navigateTo('reviews')}>← Back to reviews</button>
      <header className="course-hero">
        <div><p className="eyebrow">COURSE PROFILE</p><h1>{getCourse(activeCourseCode).name}</h1><p className="course-id">{activeCourseCode}</p><p className="course-description">{getCourse(activeCourseCode).description}</p></div>
        <div className="course-mini-score"><small>COURSE AVERAGE</small><strong>{avg(reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode))}</strong><span>{reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length} review(s)</span></div>
      </header>
      <div className="course-details-grid">
        <section className="panel teaching-history"><h2>Teaching history</h2><p>Instructors and teaching assistants for the previous two academic years.</p>
          {getCourse(activeCourseCode).history.length ? getCourse(activeCourseCode).history.map(entry=><div className="teaching-entry" key={entry.year}>
            <h3>{entry.year}</h3><div><small>INSTRUCTOR{entry.instructors.length===1?'':'S'}</small><span>{entry.instructors.join(', ')}</span></div><div><small>TEACHING ASSISTANTS</small><span>{entry.tas.join(', ')}</span></div>
          </div>) : <p className="history-empty">No example teaching records for this course.</p>}
          <p className="teaching-disclaimer">Illustrative course and teaching records; staff names are fictional.</p>
        </section>
        <section className="panel course-feedback"><div className="detail-review-head"><div><h2>Student reviews</h2><p>Feedback for {activeCourseCode} from the example community.</p></div></div>
          {reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length ? reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).map(r=><article className="course-review" key={r.id}>
            <div className="course-review-top"><strong>{r.name}</strong><span>{stars(r.rating)}</span></div><p>{r.comment||'No comment provided'}</p><div className="course-review-meta"><span>{fmtDate(r.date)}</span>{r.owner==='you'&&<button className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button>}</div>
          </article>) : <div className="course-review-empty">No reviews for this course yet.</div>}
        </section>
      </div>
    </section>
  ) : page==='overview' ? <><header className="page-head"><div><p className="eyebrow">ACADEMIC FEEDBACK PORTAL</p><h1>Course Review Board</h1><p>One place for course feedback, course signals and student opinions.</p></div></header>
   <section className="metrics"><div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong><span>Community contributions</span></div><div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong><span>Calculated across entries</span></div><div className="metric"><small>COURSES RATED</small><strong>{uniqueCourses.length}</strong><span>Unique course codes</span></div></section>
   <div className="analytic-grid"><section className="panel pulse"><div className="panel-head"><div><h2>Community rating overview</h2><p>Ratings from recent student submissions</p></div></div><div className="pulse-content"><div className="donut" role="img" aria-label={`Average rating ${avg(reviews)} out of 5`} style={{background:`conic-gradient(#218a94 0 ${(reviews.length?avg(reviews)/5*100:0)}%,#e7eef1 0 100%)`}}><div><span>{avg(reviews)}</span><small>AVERAGE</small></div></div><div className="rating-bars">{distribution.map(d=><div key={d.n} className="rating-row"><span>{d.n}★</span><div className="barbg"><i style={{width:`${d.total/Math.max(...distribution.map(x=>x.total),1)*100}%`}}/></div><small>{d.total}</small></div>)}</div></div></section>
    <section className="panel summary"><div className="panel-head"><div><h2>Course score lookup</h2><p>Check the average score for one course code.</p></div></div><label>Course code<select value={course} onChange={e=>setCourse(e.target.value)}>{[...new Set([...Object.keys(COURSE_CATALOG),...uniqueCourses.map(c=>c.toUpperCase())])].sort().map(code=><option key={code} value={code}>{code} – {getCourse(code).name}</option>)}</select></label><div className="score"><span>Overall rating</span><strong>{avg(selected)}</strong><small>{selected.length} review(s)</small></div><div className="banner">Data updates as new reviews are added.</div>{course.trim()&&<button type="button" className="lookup-course-link" onClick={()=>openCourse(course.trim().toUpperCase())}>View course details →</button>}</section></div>
  </> : <><header className="page-head"><div><p className="eyebrow">{mineOnly?'YOUR SPACE':'COMMUNITY FEEDBACK'}</p><h1>{mineOnly?'Your reviews':'Browse reviews'}</h1><p>{mineOnly?'Reviews you have written. You can edit any of them.':'Find a comment by course, rating or student.'}</p></div>{!mineOnly&&<button className="outline" onClick={()=>{if(window.confirm('Restore the example reviews? Reviews you added or edited will be lost.'))reset();}}>Reset demo</button>}</header>
   {mineOnly&&!reviews.some(r=>r.owner==='you') ? <section className="panel empty-mine"><h2>You haven't reviewed anything yet</h2><p>Use <strong>Write a review</strong> in the sidebar to share how a course went.</p></section> :
   <section className="review-list panel" id="review-list"><div className="searchbar"><div className="searchinput"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search reviews" placeholder="Search by course, comment or student"/></div><label><span>Rating</span><select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label></div><div className="rows-wrapper"><table><thead><tr><th>Course</th><th>Stars</th><th>Student comment</th>{!mineOnly&&<th>Reviewer</th>}<th>Date</th><th>Action</th></tr></thead><tbody>{result.map(r=><tr key={r.id}><td><button type="button" className="course-link" title={`View ${getCourse(r.courseCode).name}`} onClick={()=>openCourse(r.courseCode)}><strong>{r.courseCode}</strong><small>{getCourse(r.courseCode).name}</small></button></td><td className="ratingcell">{stars(r.rating)}</td><td className="commentcell">{r.comment||'No comment provided'}</td>{!mineOnly&&<td>{r.name}</td>}<td className="datecell">{fmtDate(r.date)}</td><td>{r.owner==='you'?<button className="row-edit" onClick={()=>openEditor(r)} aria-label={`Edit your ${r.courseCode} review`}>Edit</button>:<span className="dim">—</span>}</td></tr>)}{result.length===0&&<tr><td colSpan={mineOnly?5:6}>No reviews match your search.</td></tr>}</tbody></table></div><p className="tablefoot">{result.length} of {mineOnly?reviews.filter(r=>r.owner==='you').length:reviews.length} reviews</p></section>}
  </>}
  </main>
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><div className="modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit review':'Write a course review'}><div className="modal-title"><div><p className="eyebrow">YOUR CONTRIBUTION</p><h2>{editor.id?'Edit review':'Write a course review'}</h2><p>Share a rating and a short comment.</p></div><button onClick={()=>setEditor(null)} aria-label="Close">✕</button></div><form onSubmit={submit}><label>Course code<input autoFocus list="course-options" value={editor.courseCode} onChange={e=>setEditor(s=>({...s,courseCode:e.target.value}))} placeholder="e.g. CSEN701"/><datalist id="course-options">{Object.entries(COURSE_CATALOG).filter(([code])=>!reviews.some(r=>r.owner==='you'&&r.id!==editor.id&&r.courseCode.toUpperCase()===code)).map(([code,c])=><option key={code} value={code}>{c.name}</option>)}</datalist>{editor.courseCode.trim()&&<small className="field-hint">{getCourse(editor.courseCode.trim()).name}</small>}</label><label>Overall rating<select value={editor.rating} onChange={e=>setEditor(s=>({...s,rating:e.target.value}))}><option value="">Choose score</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} – {RATING_LABELS[n]}</option>)}</select></label><label>Comment<textarea value={editor.comment} rows={5} onChange={e=>setEditor(s=>({...s,comment:e.target.value}))} placeholder="Comment (optional)"/></label>{error&&<div className="formerror" role="alert">{error}{dupReview&&<> <button type="button" className="row-edit" onClick={()=>openEditor(dupReview)}>Edit that review instead</button></>}</div>}<div className="modal-actions"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="post-review" type="submit">{editor.id?'Save review':'Submit review'}</button></div></form></div></div>}
 </div>;
}
