import { Suspense } from "react";
import Header from "../../components/Header";
import ConfigTransition from "../components/ConfigTransition";
import MenuContent from "./components/MenuContent";

export default function MenuPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Menu" variant="portal" />
      <ConfigTransition>
        <div className="mx-auto w-full max-w-[1780px] pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3">
          <Suspense
            fallback={(
              <div className="flex min-h-[220px] items-center justify-center rounded-[15px] border border-(--line) bg-(--surface) text-[13px] font-medium text-(--muted)">
                Loading menu…
              </div>
            )}
          >
            <MenuContent />
          </Suspense>
        </div>
      </ConfigTransition>
    </main>
  );
}