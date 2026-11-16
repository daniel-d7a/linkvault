import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { fetchLinkPreview, getFaviconUrl, getHostname } from '../api/linkPreview';
import BookmarkFormFields from './BookmarkFormFields';
import { parseTags } from '../utils/tags';

const addSchema = Yup.object({
  url: Yup.string()
    .trim()
    .url('Enter a valid URL (include https://)')
    .required('URL is required'),
  title: Yup.string().trim().required('Title is required'),
  description: Yup.string(),
  image: Yup.string().trim().url('Enter a valid image URL').nullable(),
  collectionId: Yup.string(),
  tags: Yup.string(),
  notes: Yup.string(),
});

export default function AddBookmarkModal({
  isOpen,
  onClose,
  onAddBookmark,
  customCollections,
  defaultCollectionId,
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [previewNotice, setPreviewNotice] = useState('');

  if (!isOpen) return null;

  const initialCollection =
    customCollections.find((c) => c.id === defaultCollectionId)?.id ||
    customCollections[0]?.id ||
    '';

  const handleFetchPreview = async (url, setFieldValue, setFieldTouched) => {
    setFieldTouched('url', true);
    try {
      await Yup.string().trim().url().required().validate(url);
    } catch {
      return;
    }

    setIsFetching(true);
    setPreviewNotice('');
    const meta = await fetchLinkPreview(url.trim());
    setFieldValue('title', meta.title);
    if (meta.description) setFieldValue('description', meta.description);
    if (meta.image) setFieldValue('image', meta.image);
    setIsFetching(false);

    if (meta.usedFallback) {
      setPreviewNotice(
        'Auto-preview unavailable (missing/limited API key) — filled domain title so you can customize.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Add Bookmark
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Formik
          initialValues={{
            url: '',
            title: '',
            description: '',
            image: '',
            collectionId: initialCollection,
            tags: '',
            notes: '',
          }}
          validationSchema={addSchema}
          onSubmit={(values, { resetForm }) => {
            const cleanUrl = values.url.trim();
            onAddBookmark({
              url: cleanUrl,
              title: values.title.trim() || getHostname(cleanUrl),
              description: values.description.trim(),
              image: values.image.trim(),
              favicon: getFaviconUrl(cleanUrl),
              collectionId: values.collectionId || null,
              tags: parseTags(values.tags),
              notes: values.notes.trim(),
            });
            resetForm();
            setPreviewNotice('');
            onClose();
          }}
        >
          {({ values, errors, touched, setFieldValue, setFieldTouched }) => (
            <Form className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="url"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Field
                    id="url"
                    name="url"
                    placeholder="https://example.com/article"
                    autoFocus
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() =>
                      handleFetchPreview(values.url, setFieldValue, setFieldTouched)
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {isFetching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    Fetch Preview
                  </button>
                </div>
                {touched.url && errors.url && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.url}</p>
                )}
                {previewNotice && (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {previewNotice}
                  </p>
                )}
              </div>

              <BookmarkFormFields
                errors={errors}
                touched={touched}
                customCollections={customCollections}
              />

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Save Bookmark
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
