import { Field } from 'formik';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500';
const labelCls = 'mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300';

export default function BookmarkFormFields({
  errors,
  touched,
  customCollections,
  showImageField = true,
}) {
  return (
    <>
      <div>
        <label htmlFor="title" className={labelCls}>
          Title <span className="text-rose-500">*</span>
        </label>
        <Field
          id="title"
          name="title"
          placeholder="Page title"
          className={inputCls}
        />
        {touched.title && errors.title && (
          <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Description
        </label>
        <Field
          as="textarea"
          id="description"
          name="description"
          rows={2}
          placeholder="Short summary..."
          className={inputCls}
        />
      </div>

      {showImageField && (
        <div>
          <label htmlFor="image" className={labelCls}>
            Cover Image URL
          </label>
          <Field
            id="image"
            name="image"
            placeholder="https://example.com/og-image.png"
            className={inputCls}
          />
          {touched.image && errors.image && (
            <p className="mt-1 text-xs text-rose-600">{errors.image}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="collectionId" className={labelCls}>
            Collection
          </label>
          <Field as="select" id="collectionId" name="collectionId" className={inputCls}>
            <option value="">No collection</option>
            {customCollections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </Field>
        </div>

        <div>
          <label htmlFor="tags" className={labelCls}>
            Tags (comma-separated)
          </label>
          <Field
            id="tags"
            name="tags"
            placeholder="react, docs, ui"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>
          Notes
        </label>
        <Field
          as="textarea"
          id="notes"
          name="notes"
          rows={2}
          placeholder="Personal notes or key takeaways..."
          className={inputCls}
        />
      </div>
    </>
  );
}
