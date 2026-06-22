import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Polityka Prywatności — Stageria",
};

export default function PolitykaPrywatnosci() {
  return (
    <div className="min-h-screen bg-[#E8D9C4]">
      <header className="bg-white border-b border-[#8B6B44]/25 px-6 py-4">
        <Logo dark />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1A1410] mb-2">Polityka Prywatności</h1>
        <p className="text-sm text-[#1A1410]/40 mb-10">Obowiązuje od: 23 czerwca 2026 r.</p>

        <div className="prose prose-sm max-w-none text-[#1A1410]/70 space-y-8">

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">1. Administrator danych osobowych</h2>
            <p>Administratorem Twoich danych osobowych jest <strong>Wiesław Kamiński</strong>, prowadzący serwis Stageria pod adresem stageria.pl.</p>
            <p className="mt-2">Kontakt: <strong>kontakt@stageria.pl</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">2. Jakie dane zbieramy</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Dane rejestracyjne:</strong> adres e-mail, hasło (w postaci zaszyfrowanej)</li>
              <li><strong>Dane płatnicze:</strong> obsługiwane wyłącznie przez Stripe Inc. — Stageria nie przechowuje numerów kart płatniczych</li>
              <li><strong>Dane rozliczeniowe:</strong> identyfikator klienta Stripe, historia subskrypcji i płatności</li>
              <li><strong>Dane użytkowania:</strong> liczba generacji, daty logowań, wybrane opcje w serwisie</li>
              <li><strong>Zdjęcia:</strong> pliki graficzne wgrywane przez Użytkownika w celu przetworzenia przez AI — przechowywane tymczasowo i usuwane po przetworzeniu</li>
              <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, pliki cookie sesji</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">3. Cele i podstawy prawne przetwarzania</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="bg-[#8B6B44]/10">
                    <th className="text-left p-3 border border-[#8B6B44]/20 font-semibold text-[#1A1410]">Cel</th>
                    <th className="text-left p-3 border border-[#8B6B44]/20 font-semibold text-[#1A1410]">Podstawa prawna (RODO)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[#8B6B44]/15">Świadczenie usługi, obsługa konta</td>
                    <td className="p-3 border border-[#8B6B44]/15">Art. 6 ust. 1 lit. b — wykonanie umowy</td>
                  </tr>
                  <tr className="bg-[#8B6B44]/5">
                    <td className="p-3 border border-[#8B6B44]/15">Realizacja płatności i rozliczenia</td>
                    <td className="p-3 border border-[#8B6B44]/15">Art. 6 ust. 1 lit. b i c — wykonanie umowy, obowiązek prawny</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#8B6B44]/15">Komunikacja e-mail (obsługa, reklamacje)</td>
                    <td className="p-3 border border-[#8B6B44]/15">Art. 6 ust. 1 lit. b — wykonanie umowy</td>
                  </tr>
                  <tr className="bg-[#8B6B44]/5">
                    <td className="p-3 border border-[#8B6B44]/15">Bezpieczeństwo serwisu, zapobieganie nadużyciom</td>
                    <td className="p-3 border border-[#8B6B44]/15">Art. 6 ust. 1 lit. f — prawnie uzasadniony interes</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#8B6B44]/15">Marketing własnych usług (newsletter, jeśli wyrażono zgodę)</td>
                    <td className="p-3 border border-[#8B6B44]/15">Art. 6 ust. 1 lit. a — zgoda</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">4. Odbiorcy danych — podmioty przetwarzające</h2>
            <p className="mb-3">Twoje dane mogą być przekazywane następującym podmiotom, wyłącznie w zakresie niezbędnym do świadczenia usługi:</p>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Stripe Inc.</strong> (USA) — operator płatności; dane przekazywane na podstawie standardowych klauzul umownych (SCC) zgodnie z RODO. Polityka prywatności: stripe.com/privacy</li>
              <li><strong>Supabase Inc.</strong> (USA) — baza danych i uwierzytelnianie; dane przechowywane na serwerach w UE. Polityka prywatności: supabase.com/privacy</li>
              <li><strong>Vercel Inc.</strong> (USA) — hosting aplikacji; dane przechowywane na serwerach w regionie EU. Polityka prywatności: vercel.com/legal/privacy-policy</li>
              <li><strong>Decor8.ai</strong> — dostawca technologii AI do generowania wizualizacji; zdjęcia przekazywane do przetworzenia i usuwane po zakończeniu operacji</li>
            </ul>
            <p className="mt-3 text-sm">Stageria nie sprzedaje danych osobowych podmiotom trzecim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">5. Okres przechowywania danych</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Dane konta:</strong> przez czas trwania Konta i 3 lata po jego usunięciu (roszczenia)</li>
              <li><strong>Dane płatnicze i faktury:</strong> 5 lat (obowiązek podatkowy)</li>
              <li><strong>Zdjęcia wgrywane do przetworzenia:</strong> usuwane niezwłocznie po wygenerowaniu wizualizacji</li>
              <li><strong>Logi systemowe:</strong> do 12 miesięcy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">6. Twoje prawa</h2>
            <p className="mb-3">Na podstawie RODO przysługują Ci następujące prawa:</p>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Dostęp</strong> do swoich danych (art. 15 RODO)</li>
              <li><strong>Sprostowanie</strong> nieprawidłowych danych (art. 16 RODO)</li>
              <li><strong>Usunięcie</strong> danych („prawo do bycia zapomnianym") — art. 17 RODO</li>
              <li><strong>Ograniczenie przetwarzania</strong> (art. 18 RODO)</li>
              <li><strong>Przenoszenie danych</strong> (art. 20 RODO)</li>
              <li><strong>Sprzeciw</strong> wobec przetwarzania opartego na prawnie uzasadnionym interesie (art. 21 RODO)</li>
              <li><strong>Cofnięcie zgody</strong> w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem</li>
            </ul>
            <p className="mt-3">Aby skorzystać z powyższych praw, skontaktuj się z nami: <strong>kontakt@stageria.pl</strong>. Odpowiemy w ciągu 30 dni.</p>
            <p className="mt-2">Masz również prawo wniesienia skargi do <strong>Prezesa Urzędu Ochrony Danych Osobowych</strong> (uodo.gov.pl).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">7. Pliki cookie</h2>
            <p className="mb-3">Serwis wykorzystuje następujące rodzaje plików cookie:</p>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Niezbędne (sesyjne):</strong> przechowują stan zalogowania — wymagane do działania Serwisu, nie wymagają zgody</li>
              <li><strong>Analityczne:</strong> Google Analytics (jeśli aktywny) — zbierają anonimowe dane o korzystaniu z Serwisu w celu jego ulepszenia; możliwe do wyłączenia w ustawieniach przeglądarki</li>
            </ul>
            <p className="mt-3">Możesz zarządzać plikami cookie poprzez ustawienia swojej przeglądarki internetowej.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">8. Bezpieczeństwo danych</h2>
            <p>Stosujemy techniczne i organizacyjne środki bezpieczeństwa adekwatne do ryzyka, w tym szyfrowanie połączeń (SSL/TLS), szyfrowanie haseł oraz kontrolę dostępu do danych. Serwis hostowany jest na infrastrukturze Vercel z certyfikatem SSL.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">9. Zmiany polityki prywatności</h2>
            <p>O istotnych zmianach w Polityce Prywatności będziemy informować drogą e-mail lub poprzez komunikat w Serwisie. Data ostatniej aktualizacji widnieje na górze dokumentu.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">10. Kontakt</h2>
            <p>W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:</p>
            <p className="mt-2"><strong>E-mail:</strong> kontakt@stageria.pl<br /><strong>Serwis:</strong> stageria.pl</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-[#8B6B44]/20">
          <Link href="/" className="text-sm text-[#C9A96E] hover:underline">← Powrót na stronę główną</Link>
        </div>
      </main>
    </div>
  );
}
