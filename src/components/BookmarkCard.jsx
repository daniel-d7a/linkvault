import { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { getHostname } from '../api/linkPreview';
import BookmarkActions from './BookmarkActions';

export default function BookmarkCard({
  bookmark,
  collectionName,
  onToggleFavorite,
  onEdit,
  onDelete,
  onTagClick,
}) {
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const domain = getHostname(bookmark.url);
  const showImage = Boolean(bookmark.image) && !imgError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-40 w-full overflow-hidden border-b border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
      >
        {showImage ? (
          <img
            src={bookmark.image}
            alt={bookmark.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/80 px-4 text-center dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900">
            {bookmark.favicon && !faviconError ? (
              <img
                src={bookmark.favicon}
                alt=""
                onError={() => setFaviconError(true)}
                className="h-8 w-8 rounded-md bg-white p-1 shadow-xs dark:bg-slate-900"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-400 shadow-xs dark:bg-slate-900">
                <Globe className="h-4 w-4" />
              </div>
            )}
            <span className="max-w-full truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {domain}
            </span>
          </div>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-md bg-white/90 p-1.5 text-slate-600 opacity-0 shadow-xs backdrop-blur-xs transition-opacity group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-300">
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </a>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {bookmark.favicon && !faviconError ? (
              <img
                src={bookmark.favicon}
                alt=""
                onError={() => setFaviconError(true)}
                className="h-4 w-4 shrink-0 rounded-xs"
              />
            ) : (
              <Globe className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {domain}
            </span>
          </div>
          {collectionName && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {collectionName}
            </span>
          )}
        </div>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
        >
          {bookmark.title}
        </a>

        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {bookmark.description || 'No description provided.'}
        </p>

        {bookmark.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <BookmarkActions
            bookmark={bookmark}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
