export default function AddFormFactorPage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header className="space-y-2">
       
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 ">Create New Formfactor</h1>
       
      </header>

      <form className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="space-y-2">
          <label className="label" htmlFor="formfactor-name">Formfactor Name</label>
          <input
            id="formfactor-name"
            name="formfactor-name"
            className="input"
            placeholder="e.g. Wristband"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="formfactor-number">Number</label>
          <input
            id="formfactor-number"
            name="formfactor-number"
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 7"
          />
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="sheet-qty">Sheet Qty</label>
          <input
            id="sheet-qty"
            name="sheet-qty"
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 250"
          />
        </div>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Add
        </button>
      </form>
    </section>
  );
}
