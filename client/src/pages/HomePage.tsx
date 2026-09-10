import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col p-5">
      <header className="flex items-center justify-between">
        <span className="text-xl font-bold">instacashly</span>
        <button
          type="button"
          className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
        >
          How it works
        </button>
      </header>

      <main className="mt-8">
        <section>
          <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            Buying in Dallas–Fort Worth
          </p>
          <h1 className="mt-2 font-serif text-[2.5rem] leading-[1.15]">
            Photos in.
            <br />
            Cash range out.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Your number within 90 seconds. Upload the property however it looks
            right now — the more you show us, the closer the number gets to what
            the house is really worth.
          </p>
          <button
            onClick={() => navigate("/addresses")}
            type="button"
            className="mt-6 w-full rounded-full bg-yellow-400 py-4 text-lg font-bold transition-colors hover:bg-yellow-500"
          >
            Start with my address
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            No obligation. No showings. No fees.
          </p>
        </section>

        <ul className="mt-8 grid grid-cols-3 gap-2">
          <li className="rounded-2xl bg-gray-100 p-3">
            <p className="text-2xl font-bold">90s</p>
            <p className="mt-1 text-sm text-gray-500">to a number</p>
          </li>
          <li className="rounded-2xl bg-gray-100 p-3">
            <p className="text-2xl font-bold">$0</p>
            <p className="mt-1 text-sm text-gray-500">fees at closing</p>
          </li>
          <li className="rounded-2xl bg-gray-100 p-3">
            <p className="text-2xl font-bold">4,118</p>
            <p className="mt-1 text-sm text-gray-500">priced so far</p>
          </li>
        </ul>
      </main>

      <footer className="mt-auto rounded-2xl bg-blue-100 p-4">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-600 uppercase">
          <span
            className="h-2 w-2 rounded-full bg-amber-400"
            aria-hidden="true"
          />
          Live · 7 offers sent today
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li className="flex justify-between">
            <span>Tasha in Saginaw</span>
            <span>$189,750</span>
          </li>
          <li className="flex justify-between">
            <span>Marcus in Arlington</span>
            <span>$214,000</span>
          </li>
        </ul>
      </footer>
    </div>
  );
};
