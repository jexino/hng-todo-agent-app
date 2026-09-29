import { useEffect, useState } from 'react';
import {
  ArrowDownWideNarrow, ArrowUpRight, Check, CheckCheck, ChevronDown, Circle,
  ClipboardList, FileText, Lightbulb, LoaderCircle, Menu, Plus, Search,
  Sparkles, Trash2, X
} from 'lucide-react';
import { notesApi, smartAssistApi, tasksApi } from './api.js';

const categories = ['Work', 'Personal', 'Learning', 'Health', 'Other'];
const blankTask = { title: '', description: '', category: 'Other', due_date: null };
const blankNote = { title: '', body: '', color: 'paper' };
const noteColors = ['paper', 'mint', 'rose', 'sky'];

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(value);
}

function App() {
  const [view, setView] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [taskDraft, setTaskDraft] = useState(blankTask);
  const [noteDraft, setNoteDraft] = useState(blankNote);
  const [editingTask, setEditingTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState('All tasks');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [assistBusy, setAssistBusy] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [taskData, noteData] = await Promise.all([tasksApi.list(), notesApi.list()]);
      setTasks(taskData);
      setNotes(noteData);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitTask(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const values = { ...taskDraft, title: taskDraft.title.trim() };
      if (editingTask) {
        const updated = await tasksApi.update(editingTask, values);
        setTasks((current) => current.map((task) => task.id === editingTask ? updated : task));
        setEditingTask(null);
      } else {
        const created = await tasksApi.create(values);
        setTasks((current) => [created, ...current]);
      }
      setTaskDraft(blankTask);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task) {
    try {
      const updated = await tasksApi.update(task.id, { completed: !task.completed });
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
    } catch (taskError) {
      setError(taskError.message);
    }
  }

  async function deleteTask(id) {
    try {
      await tasksApi.remove(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      if (editingTask === id) cancelTaskEdit();
    } catch (taskError) {
      setError(taskError.message);
    }
  }

  function editTask(task) {
    setEditingTask(task.id);
    setTaskDraft({ title: task.title, description: task.description || '', category: task.category || 'Other', due_date: task.due_date || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelTaskEdit() {
    setEditingTask(null);
    setTaskDraft(blankTask);
  }

  async function categorizeTask() {
    if (!taskDraft.title.trim()) {
      setError('Add a task title before asking Smart Assist to categorize it.');
      return;
    }
    setAssistBusy(true);
    setError('');
    try {
      const result = await smartAssistApi.run('categorize', `${taskDraft.title} ${taskDraft.description}`);
      setTaskDraft((current) => ({ ...current, category: result.category }));
    } catch (assistError) {
      setError(assistError.message);
    } finally {
      setAssistBusy(false);
    }
  }

  async function submitNote(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const values = { ...noteDraft, title: noteDraft.title.trim() };
      if (editingNote) {
        const updated = await notesApi.update(editingNote, values);
        setNotes((current) => current.map((note) => note.id === editingNote ? updated : note));
        setEditingNote(null);
      } else {
        const created = await notesApi.create(values);
        setNotes((current) => [created, ...current]);
      }
      setNoteDraft(blankNote);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function summarizeNote() {
    if (!noteDraft.body.trim()) {
      setError('Add some note text before asking Smart Assist to summarize it.');
      return;
    }
    setAssistBusy(true);
    setError('');
    try {
      const result = await smartAssistApi.run('summarize', noteDraft.body);
      setNoteDraft((current) => ({ ...current, body: result.summary }));
    } catch (assistError) {
      setError(assistError.message);
    } finally {
      setAssistBusy(false);
    }
  }

  function editNote(note) {
    setEditingNote(note.id);
    setNoteDraft({ title: note.title, body: note.body || '', color: note.color || 'paper' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteNote(id) {
    try {
      await notesApi.remove(id);
      setNotes((current) => current.filter((note) => note.id !== id));
      if (editingNote === id) {
        setEditingNote(null);
        setNoteDraft(blankNote);
      }
    } catch (noteError) {
      setError(noteError.message);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'All tasks' || (filter === 'Completed' ? task.completed : !task.completed);
    const searchText = `${task.title} ${task.description} ${task.category}`.toLowerCase();
    return matchesFilter && searchText.includes(query.toLowerCase());
  });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><CheckCheck size={19} strokeWidth={2.4} /></span>
          <span>daymark<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={view === 'tasks' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('tasks'); setMenuOpen(false); }}>
            <ClipboardList size={18} /><span>My tasks</span><span className="nav-count">{pendingCount}</span>
          </button>
          <button className={view === 'notes' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('notes'); setMenuOpen(false); }}>
            <FileText size={18} /><span>Notes</span><span className="nav-count">{notes.length}</span>
          </button>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-label">TASK VIEWS</div>
        <nav className="filter-nav" aria-label="Task filters">
          {['All tasks', 'Open', 'Completed'].map((item) => (
            <button key={item} className={filter === item ? 'filter-item selected' : 'filter-item'} onClick={() => { setFilter(item); setView('tasks'); setMenuOpen(false); }}>
              <span className={`filter-dot ${item.toLowerCase().replace(' ', '-')}`} />{item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><Lightbulb size={17} /></div>
          <p>A little progress<br />adds up to a lot.</p>
          <span>Keep showing up.</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}><Menu size={20} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{view === 'tasks' ? 'My tasks' : 'Notes'}</strong></div>
          <div className="topbar-right"><span className="today-date">{formatDate(new Date())}</span><span className="avatar">D</span></div>
        </header>

        <div className="content-wrap">
          {error && <div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={17} /></button></div>}
          {view === 'tasks' ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow"><span className="eyebrow-mark" /> A clear mind starts here</div>
                  <h1>Make room for<br /><em>what matters.</em></h1>
                  <p className="heading-subtitle">One thing at a time. You've got this.</p>
                </div>
                <div className="progress-stat"><div className="progress-ring"><span>{tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}<small>%</small></span></div><div><strong>{completedCount} of {tasks.length}</strong><span>tasks complete</span></div></div>
              </section>

              <section className="task-composer" aria-label={editingTask ? 'Edit task' : 'Create a task'}>
                <div className="composer-top"><span className="composer-icon"><Plus size={18} /></span><div><h2>{editingTask ? 'Edit this task' : 'Add to your list'}</h2><p>{editingTask ? 'Make a quick change and save.' : 'Capture it now, focus on it later.'}</p></div></div>
                <form onSubmit={submitTask} className="task-form">
                  <label className="sr-only" htmlFor="task-title">Task title</label>
                  <input id="task-title" className="title-input" maxLength="160" required placeholder="What needs doing?" value={taskDraft.title} onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })} />
                  <label className="sr-only" htmlFor="task-description">Task details</label>
                  <input id="task-description" className="detail-input" maxLength="4000" placeholder="Add a few details (optional)" value={taskDraft.description} onChange={(event) => setTaskDraft({ ...taskDraft, description: event.target.value })} />
                  <div className="composer-controls">
                    <div className="select-wrap"><select aria-label="Task category" value={taskDraft.category} onChange={(event) => setTaskDraft({ ...taskDraft, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={15} /></div>
                    <button type="button" className="assist-button" onClick={categorizeTask} disabled={assistBusy}><Sparkles size={15} />{assistBusy ? 'Thinking…' : 'Smart categorize'}</button>
                    <span className="control-spacer" />
                    {editingTask && <button type="button" className="text-button" onClick={cancelTaskEdit}>Cancel</button>}
                    <button className="add-button" type="submit" disabled={busy || !taskDraft.title.trim()}>{busy ? <LoaderCircle className="spin" size={16} /> : editingTask ? <Check size={16} /> : <Plus size={16} />}{editingTask ? 'Save changes' : 'Add task'}</button>
                  </div>
                </form>
              </section>

              <section className="task-section">
                <div className="section-heading"><div><h2>Your list <span className="count-pill">{visibleTasks.length}</span></h2><p>{pendingCount} open · {completedCount} completed</p></div>
                  <div className="task-tools"><label className="search-box"><Search size={16} /><input aria-label="Search tasks" placeholder="Find a task" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label><button className="icon-button sort-button" title="Tasks are sorted by newest first" aria-label="Sort tasks"><ArrowDownWideNarrow size={18} /></button></div>
                </div>
                {loading ? <div className="loading-state"><LoaderCircle className="spin" size={21} />Loading your day…</div> : visibleTasks.length ? (
                  <div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.completed ? 'task-done' : ''}`} key={task.id}>
                    <button className={`check-button ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => toggleTask(task)}>{task.completed ? <Check size={14} /> : <Circle size={19} />}</button>
                    <button className="task-copy" onClick={() => editTask(task)}><strong>{task.title}</strong>{task.description && <span>{task.description}</span>}</button>
                    <span className={`category-tag category-${task.category.toLowerCase()}`}>{task.category}</span>
                    {task.due_date && <span className="due-date">{task.due_date}</span>}
                    <div className="row-actions"><button className="icon-button" title="Edit task" aria-label={`Edit ${task.title}`} onClick={() => editTask(task)}><ArrowUpRight size={16} /></button><button className="icon-button delete-action" title="Delete task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={16} /></button></div>
                  </article>)}</div>
                ) : <div className="empty-state"><span className="empty-icon"><ClipboardList size={23} /></span><strong>{query ? 'Nothing matches that search.' : filter === 'Completed' ? 'No completed tasks yet.' : 'A fresh page.'}</strong><span>{query ? 'Try another phrase.' : 'Add a task above and start with one small step.'}</span></div>}
              </section>
            </>
          ) : (
            <>
              <section className="page-heading notes-heading"><div><div className="eyebrow"><span className="eyebrow-mark" /> Keep the good thoughts</div><h1>Somewhere to<br /><em>put it all.</em></h1><p className="heading-subtitle">Ideas, reminders, and things worth remembering.</p></div><div className="note-count"><FileText size={18} /><strong>{notes.length}</strong><span>saved notes</span></div></section>
              <div className="notes-layout">
                <section className="note-composer">
                  <div className="composer-top"><span className="composer-icon note-composer-icon"><FileText size={17} /></span><div><h2>{editingNote ? 'Edit your note' : 'New note'}</h2><p>Let the thought land somewhere.</p></div></div>
                  <form onSubmit={submitNote} className="note-form">
                    <label className="sr-only" htmlFor="note-title">Note title</label><input id="note-title" className="title-input" maxLength="160" required placeholder="Give it a title" value={noteDraft.title} onChange={(event) => setNoteDraft({ ...noteDraft, title: event.target.value })} />
                    <label className="sr-only" htmlFor="note-body">Note content</label><textarea id="note-body" maxLength="12000" placeholder="Start writing…" value={noteDraft.body} onChange={(event) => setNoteDraft({ ...noteDraft, body: event.target.value })} rows="8" />
                    <div className="note-color-picker" aria-label="Note color">{noteColors.map((color) => <button key={color} type="button" className={`color-swatch swatch-${color} ${noteDraft.color === color ? 'swatch-selected' : ''}`} aria-label={`${color} note color`} aria-pressed={noteDraft.color === color} onClick={() => setNoteDraft({ ...noteDraft, color })} />)}</div>
                    <div className="note-form-actions"><button type="button" className="assist-button" onClick={summarizeNote} disabled={assistBusy}><Sparkles size={15} />{assistBusy ? 'Thinking…' : 'Summarize note'}</button><span className="control-spacer" />{editingNote && <button type="button" className="text-button" onClick={() => { setEditingNote(null); setNoteDraft(blankNote); }}>Cancel</button>}<button className="add-button" type="submit" disabled={busy || !noteDraft.title.trim()}>{busy ? <LoaderCircle className="spin" size={16} /> : editingNote ? <Check size={16} /> : <Plus size={16} />}{editingNote ? 'Save note' : 'Save note'}</button></div>
                  </form>
                  <div className="assist-footnote"><Sparkles size={13} /> Smart Assist uses a local prompt-template simulation.</div>
                </section>
                <section className="notes-wall" aria-label="Saved notes">
                  {loading ? <div className="loading-state"><LoaderCircle className="spin" size={21} />Finding your notes…</div> : notes.length ? notes.map((note) => <article key={note.id} className={`note-card note-${note.color}`}><div className="note-card-top"><span className="note-date">{new Date(note.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span><div className="row-actions"><button className="icon-button" aria-label={`Edit ${note.title}`} title="Edit note" onClick={() => editNote(note)}><ArrowUpRight size={16} /></button><button className="icon-button delete-action" aria-label={`Delete ${note.title}`} title="Delete note" onClick={() => deleteNote(note.id)}><Trash2 size={16} /></button></div></div><h3>{note.title}</h3><p>{note.body || 'An empty page, ready for the next thought.'}</p></article>) : <div className="empty-state notes-empty"><span className="empty-icon"><FileText size={23} /></span><strong>No notes, just yet.</strong><span>Save a thought and it will be here when you need it.</span></div>}
                </section>
              </div>
            </>
          )}
          <footer className="page-footer"><span>DAYMARK</span><span>Built for a little more clarity.</span><span>{formatDate(new Date())}</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
