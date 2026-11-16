import { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bookmark, ExternalLink, RotateCcw } from 'lucide-react';
import { DEFAULT_BOOKMARKS, DEFAULT_COLLECTIONS } from './data/seedData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getHostname } from './api/linkPreview';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BookmarkCard from './components/BookmarkCard';
import BookmarkRow from './components/BookmarkRow';
import AddBookmarkModal from './components/AddBookmarkModal';
import EditBookmarkModal from './components/EditBookmarkModal';

export default function App() {
  const [collections, setCollections] = useLocalStorage(
    'lv_collections',
    DEFAULT_COLLECTIONS
  );
  const [bookmarks, setBookmarks] = useLocalStorage(
    'lv_bookmarks',
    DEFAULT_BOOKMARKS
  );
  const [darkMode, setDarkMode] = useLocalStorage('lv_dark_mode', false);

  const [activeCollectionId, setActiveCollectionId] = useState('col-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const customCollections = useMemo(
    () => collections.filter((c) => !c.isSystem),
    [collections]
  );

  const collectionMap = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set();
    bookmarks.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return bookmarks
      .filter((b) => {
        if (activeCollectionId === 'col-fav' && !b.isFavorite) return false;
        if (
          !['col-all', 'col-fav'].includes(activeCollectionId) &&
          b.collectionId !== activeCollectionId
        ) {
          return false;
        }

        if (selectedTag !== 'all' && !b.tags?.includes(selectedTag)) {
          return false;
        }

        if (q) {
          const haystack = [
            b.title,
            b.description,
            b.url,
            b.notes,
            ...(b.tags || []),
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'domain') {
          return getHostname(a.url).localeCompare(getHostname(b.url));
        }
        return 0;
      });
  }, [bookmarks, activeCollectionId, selectedTag, searchQuery, sortBy]);

  const handleOpenAll = () => {
    if (filteredBookmarks.length === 0) return;
    if (
      filteredBookmarks.length > 5 &&
      !window.confirm(`Open ${filteredBookmarks.length} links in new tabs?`)
    ) {
      return;
    }
    filteredBookmarks.forEach((b) => {
      window.open(b.url, '_blank', 'noopener,noreferrer');
    });
    toast.success(`Opened ${filteredBookmarks.length} links`);
  };

  // Bookmark CRUD
  const handleAddBookmark = (data) => {
    const newBookmark = {
      id: `bm-${Date.now()}`,
      ...data,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [newBookmark, ...prev]);
    toast.success('Bookmark saved!');
  };

  const handleSaveBookmark = (id, updates) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    toast.success('Bookmark updated!');
  };

  const handleToggleFavorite = (id) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  const handleDeleteBookmark = (id) => {
    const target = bookmarks.find((b) => b.id === id);
    if (!target) return;

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast(
      (t) => (
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="max-w-[180px] truncate">Deleted "{target.title}"</span>
          <button
            type="button"
            onClick={() => {
              setBookmarks((prev) => [target, ...prev]);
              toast.dismiss(t.id);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 font-semibold text-amber-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <RotateCcw className="h-3 w-3" />
            Undo
          </button>
        </div>
      ),
      { duration: 4000 }
    );
  };

  // Collection CRUD
  const handleAddCollection = (name) => {
    const newCol = {
      id: `col-${Date.now()}`,
      name,
      isSystem: false,
    };
    setCollections((prev) => [...prev, newCol]);
    toast.success(`Created "${name}"`);
  };

  const handleRenameCollection = (id, name) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    toast.success('Collection renamed');
  };

  const handleDeleteCollection = (id) => {
    const remainingCustom = collections.filter((c) => !c.isSystem && c.id !== id);
    const fallbackId = remainingCustom[0]?.id || null;

    setCollections((prev) => prev.filter((c) => c.id !== id));
    setBookmarks((prev) =>
      prev.map((b) =>
        b.collectionId === id ? { ...b, collectionId: fallbackId } : b
      )
    );
    if (activeCollectionId === id) {
      setActiveCollectionId('col-all');
    }
    toast.success('Collection deleted');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedTag !== 'all' ||
    activeCollectionId !== 'col-all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('all');
    setActiveCollectionId('col-all');
  };

  const activeTitle = collectionMap[activeCollectionId] || 'All Bookmarks';

  return (
    <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            'text-xs font-medium dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700',
        }}
      />

      <Sidebar
        collections={collections}
        bookmarks={bookmarks}
        activeCollectionId={activeCollectionId}
        onSelectCollection={setActiveCollectionId}
        onAddCollection={handleAddCollection}
        onRenameCollection={handleRenameCollection}
        onDeleteCollection={handleDeleteCollection}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          allTags={allTags}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {activeTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredBookmarks.length}{' '}
                {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                {selectedTag !== 'all' && ` • tagged #${selectedTag}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Clear Filters
                </button>
              )}
              {filteredBookmarks.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open All
                </button>
              )}
            </div>
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-xs ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <Bookmark className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                No bookmarks found
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                {hasActiveFilters
                  ? 'Try adjusting your search query, tag filter, or selected collection.'
                  : 'Save your first link to start building your vault.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  + Add Link
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  collectionName={collectionMap[bookmark.collectionId]}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={setEditingBookmark}
                  onDelete={handleDeleteBookmark}
                  onTagClick={(tag) => setSelectedTag(tag)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  collectionName={collectionMap[bookmark.collectionId]}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={setEditingBookmark}
                  onDelete={handleDeleteBookmark}
                  onTagClick={(tag) => setSelectedTag(tag)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddBookmarkModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddBookmark={handleAddBookmark}
        customCollections={customCollections}
        defaultCollectionId={activeCollectionId}
      />

      <EditBookmarkModal
        bookmark={editingBookmark}
        onClose={() => setEditingBookmark(null)}
        onSaveBookmark={handleSaveBookmark}
        customCollections={customCollections}
      />
    </div>
  );
}
