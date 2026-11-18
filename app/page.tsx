import { convertUrl } from "@/features/convert";

import { ConverterScreen } from "./_components/converter-screen";
import { INITIAL_EXAMPLE } from "./_components/examples";

// The example result is converted at build time and refreshed at most once a day.
export const revalidate = 86400;

export default async function Home() {
  const initial = await convertUrl(INITIAL_EXAMPLE);
  return <ConverterScreen initial={initial.ok ? initial.page : undefined} />;
}
