import React, { useState, useEffect } from 'react';
import { FileText, Layers, Search, Upload, BookOpen, MessageSquare, Plus, ArrowLeft, Search as SearchIcon, MoreVertical, FolderPlus, User as UserIcon, LogOut, TrendingUp, Hash, Mail, Trash2 } from 'lucide-react';
import { getPapers, getAnnotations, createAnnotation, searchAnnotations, getCollections, createCollection, addPaperToCollection, deletePaper } from './api/paperApi';
import UploadModal from './components/UploadModal';
import PdfViewer from './components/PdfViewer';
import useSocket from './hooks/useSocket';
import { useAuth } from './context/AuthContext';
import { LoginPage, SignupPage } from './pages/Auth';

const App = () => {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login', 'signup'
  const [view, setView] = useState('all'); // 'all', 'collections', 'search', 'profile'
  const [papers, setPapers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      const res = await getPapers();
      setPapers(res.data);
    } catch (err) {
      console.error('Failed to fetch papers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await getCollections();
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPapers();
      fetchCollections();
    }
  }, [user]);

  const handleDeletePaper = async (id) => {
    if (window.confirm('Are you sure you want to delete this paper? This will also remove all its annotations.')) {
      try {
        await deletePaper(id);
        fetchPapers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete paper');
      }
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName) return;
    await createCollection({ name: newCollectionName });
    setNewCollectionName('');
    setIsCollectionModalOpen(false);
    fetchCollections();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const res = await searchAnnotations(searchQuery);
    setSearchResults(res.data);
  };

  useEffect(() => {
    if (selectedPaper) {
      const fetchAnns = async () => {
        const res = await getAnnotations(selectedPaper._id);
        setAnnotations(res.data);
      };
      fetchAnns();
    }
  }, [selectedPaper]);

  useSocket(selectedPaper?._id, (newAnn) => {
    setAnnotations(prev => [...prev.filter(a => a._id !== newAnn._id), newAnn]);
  });

  if (!user) {
    return authView === 'login' 
      ? <LoginPage onSwitch={() => setAuthView('signup')} /> 
      : <SignupPage onSwitch={() => setAuthView('login')} />;
  }

  if (selectedPaper) {
    return (
      <div className="h-screen flex flex-col bg-slate-900">
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 text-white shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedPaper(null)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold truncate max-w-md">{selectedPaper.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">Collaborative Mode</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <PdfViewer 
            fileUrl={`${import.meta.env.PROD ? 'https://research-annotation-platform.onrender.com' : 'http://localhost:5001'}${selectedPaper.fileUrl}`} 
            annotations={annotations}
            paperId={selectedPaper._id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <aside className="hidden md:flex w-64 glass border-r flex flex-col z-10 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
            <BookOpen size={24} />
            Annotator
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<FileText size={20} />} label="All Papers" active={view === 'all'} onClick={() => setView('all')} />
          <NavItem icon={<Layers size={20} />} label="Collections" active={view === 'collections'} onClick={() => setView('collections')} />
          <NavItem icon={<Search size={20} />} label="Search" active={view === 'search'} onClick={() => setView('search')} />
          <NavItem icon={<UserIcon size={20} />} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} />
        </nav>

        <div className="p-4 border-t space-y-2">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
          >
            <Upload size={16} />
            Upload Paper
          </button>
          <button 
            onClick={() => setIsCollectionModalOpen(true)}
            className="w-full py-2 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New Collection
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <header className="h-16 glass border-b flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="md:hidden text-indigo-600">
              <BookOpen size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 capitalize">{view}</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 hover:bg-slate-100 rounded-xl transition-all" onClick={() => setView('profile')}>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">{user.username}</span>
                <span className="text-[10px] text-slate-400">Researcher</span>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm uppercase text-sm">
                {user.username.substring(0, 2)}
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {view === 'all' && (
              <>
                <h3 className="text-2xl font-bold text-slate-800 mb-8">Recent Papers</h3>
                {loading ? (
                  <div className="text-slate-400">Loading library...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {papers.map(paper => (
                      <PaperCard 
                        key={paper._id} 
                        paper={paper}
                        collections={collections}
                        onAdd={(colId) => {
                          addPaperToCollection(colId, paper._id);
                          fetchPapers();
                        }}
                        onClick={() => setSelectedPaper(paper)}
                        onDelete={handleDeletePaper}
                        currentUser={user}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {view === 'collections' && (
              <div className="space-y-8">
                {collections.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-slate-400">
                    <Layers size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No collections created yet.</p>
                  </div>
                ) : (
                  collections.map(col => (
                    <div key={col._id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                          {col.name}
                          <span className="text-sm font-normal text-slate-400">({col.papers?.length || 0} papers)</span>
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {col.papers?.map(paper => (
                          <PaperCard 
                            key={paper._id} 
                            paper={paper}
                            collections={collections}
                            onClick={() => setSelectedPaper(paper)}
                            onDelete={handleDeletePaper}
                            currentUser={user}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {view === 'profile' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-6 md:p-10 rounded-[32px] border shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <div className="w-32 h-32 rounded-[24px] bg-indigo-600 flex items-center justify-center text-5xl text-white font-bold shadow-2xl shadow-indigo-200 uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{user.username}</h3>
                    <p className="text-slate-500 mb-6 flex items-center gap-2">
                      <Mail size={16} /> {user.email}
                    </p>
                    <div className="flex gap-8">
                      <StatItem icon={<FileText size={18} />} value={papers.length} label="Papers" />
                      <StatItem icon={<MessageSquare size={18} />} value={annotations.length} label="Annotations" />
                      <StatItem icon={<Layers size={18} />} value={collections.length} label="Collections" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border shadow-sm">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-indigo-500" />
                      Recent Activity
                    </h4>
                    <div className="space-y-4">
                      <ActivityItem text="Highlighted 'Abstract' in 'Attention Is All You Need'" time="2 hours ago" />
                      <ActivityItem text="Added 'Paper A' to 'Reading List'" time="Yesterday" />
                      <ActivityItem text="Commented on 'ResNet' methodology" time="3 days ago" />
                    </div>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold mb-4">Account Settings</h4>
                      <p className="text-indigo-100 text-sm mb-8">Manage your collaborative preferences and account details.</p>
                      <button 
                        onClick={logout}
                        className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  </div>
                </div>
              </div>
            )}

            {view === 'search' && (
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-12">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search comments and highlights..."
                      className="w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap">Search All Papers</button>
                </form>

                <div className="space-y-6">
                  {searchResults.map(res => (
                    <div key={res._id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedPaper(res.paperId)}>
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">
                        <MessageSquare size={14} />
                        Annotation in "{res.paperId.title}"
                      </div>
                      <p className="text-slate-700 italic border-l-4 border-indigo-100 pl-4 py-1">"{res.content}"</p>
                      <div className="mt-4 text-xs text-slate-400">Page {res.position?.pageNumber}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchPapers}
      />

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t flex justify-around p-2 z-50">
        <NavItem icon={<FileText size={20} />} active={view === 'all'} onClick={() => setView('all')} mobile />
        <NavItem icon={<Layers size={20} />} active={view === 'collections'} onClick={() => setView('collections')} mobile />
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 -mt-6 border-4 border-slate-50"
        >
          <Upload size={20} />
        </button>
        <NavItem icon={<Search size={20} />} active={view === 'search'} onClick={() => setView('search')} mobile />
        <NavItem icon={<UserIcon size={20} />} active={view === 'profile'} onClick={() => setView('profile')} mobile />
      </nav>

      {/* New Collection Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
             <button onClick={() => setIsCollectionModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg">
                <Plus size={20} className="rotate-45" />
             </button>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <input 
                autoFocus
                type="text" 
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Create Collection</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick, mobile = false }) => (
  <button onClick={onClick} className={`flex items-center gap-3 rounded-xl transition-all ${
    mobile ? 'p-2 flex-col gap-1' : 'w-full px-4 py-3'
  } ${
    active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
  }`}>
    {icon}
    {!mobile && <span>{label}</span>}
    {mobile && <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>}
  </button>
);

const StatItem = ({ icon, value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-2 text-indigo-600 mb-1">
      {icon}
      <span className="text-2xl font-black">{value}</span>
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

const ActivityItem = ({ text, time }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0">
    <div className="w-2 h-2 mt-2 bg-indigo-400 rounded-full shrink-0"></div>
    <div>
      <p className="text-sm text-slate-700 leading-snug">{text}</p>
      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{time}</p>
    </div>
  </div>
);

const PaperCard = ({ paper, collections = [], onAdd, onClick, onDelete, currentUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Debug Logging to help identify permission issues
  useEffect(() => {
    if (showMenu) {
      console.log('Ownership Check:', {
        paperTitle: paper.title,
        currentUserId: currentUser?.id || currentUser?._id,
        uploaderId: paper.uploader?._id || paper.uploader,
        fullUser: currentUser,
        fullUploader: paper.uploader
      });
    }
  }, [showMenu]);

  const currentUserId = String(currentUser?.id || currentUser?._id || '');
  const uploaderId = String(paper.uploader?._id || paper.uploader || '');
  const isOwner = currentUserId && uploaderId && currentUserId === uploaderId;

  // Generate a premium background gradient based on title
  const gradients = [
    'from-blue-600/20 to-indigo-600/10',
    'from-emerald-600/20 to-teal-600/10',
    'from-violet-600/20 to-purple-600/10',
    'from-rose-600/20 to-orange-600/10',
    'from-cyan-600/20 to-blue-600/10'
  ];
  const gradientIdx = (paper.title?.length || 0) % gradients.length;
  const bgGradient = gradients[gradientIdx];

  return (
    <div 
      className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col overflow-hidden"
      onClick={onClick}
    >
      {/* Visual Header / Background */}
      <div className={`h-32 w-full bg-gradient-to-br ${bgGradient} relative flex items-center justify-center overflow-hidden border-b border-slate-100`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <FileText size={48} className="text-white/40 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 bg-white/50 backdrop-blur-md hover:bg-white rounded-xl text-slate-700 transition-all border border-white/20"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl z-20 py-2 border border-slate-200 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(paper._id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-bold border-b border-slate-100 mb-2"
                >
                  <Trash2 size={14} />
                  Delete Paper
                </button>

                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Add to Collection</div>
                {collections.map(col => (
                  <button 
                    key={col._id}
                    onClick={(e) => { e.stopPropagation(); onAdd(col._id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FolderPlus size={14} />
                    {col.name}
                  </button>
                ))}
                {collections.length === 0 && <div className="px-4 py-2 text-xs text-slate-400 italic">No collections yet</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <h4 className="text-lg font-bold text-slate-800 mb-1 leading-tight line-clamp-2 min-h-[3rem]">{paper.title}</h4>
        <p className="text-sm text-slate-500 mb-4 truncate italic">{paper.author || 'Unknown Author'}</p>
        <div className="flex flex-wrap gap-2">
          {paper.collections?.map(col => (
            <span key={col._id} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-indigo-100">{col.name}</span>
          ))}
          {!paper.collections?.length && <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-slate-200">Uncategorized</span>}
        </div>
      </div>
    </div>
  );
};

export default App;
