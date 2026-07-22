import type { PrecacheEntry } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Dados autenticados NUNCA ficam em Cache Storage — num aparelho
    // compartilhado, o próximo usuário não pode ler relatórios/fotos do anterior.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/"),
      handler: new NetworkOnly(),
    },
    // defaultCache: NetworkFirst para páginas — offline serve a última versão em cache
    ...defaultCache,
  ],
});

serwist.addEventListeners();
