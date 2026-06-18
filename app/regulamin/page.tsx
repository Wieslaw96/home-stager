import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Regulamin — Stageria",
};

export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-[#E8D9C4]">
      <header className="bg-white border-b border-[#8B6B44]/25 px-6 py-4">
        <Logo dark />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1A1410] mb-2">Regulamin świadczenia usług</h1>
        <p className="text-sm text-[#1A1410]/40 mb-10">Obowiązuje od: 23 czerwca 2026 r.</p>

        <div className="prose prose-sm max-w-none text-[#1A1410]/70 space-y-8">

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 1. Postanowienia ogólne</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego Stageria, dostępnego pod adresem <strong>stageria.pl</strong>, świadczącego usługę wirtualnego stagingu nieruchomości z wykorzystaniem sztucznej inteligencji.</li>
              <li>Usługodawcą jest Wiesław Kamiński, prowadzący działalność gospodarczą, e-mail: <strong>wiesik4040@gmail.com</strong> (dalej: „Stageria" lub „Usługodawca").</li>
              <li>Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.</li>
              <li>Regulamin jest udostępniany nieodpłatnie na stronie stageria.pl/regulamin w formie umożliwiającej jego utrwalenie.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 2. Definicje</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li><strong>Serwis</strong> – platforma internetowa dostępna pod adresem stageria.pl.</li>
              <li><strong>Użytkownik</strong> – osoba fizyczna, prawna lub jednostka organizacyjna posiadająca konto w Serwisie.</li>
              <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie.</li>
              <li><strong>Subskrypcja</strong> – płatny dostęp do Serwisu w ramach wybranego planu (Starter, Agent, Agencja).</li>
              <li><strong>Generacja</strong> – jednorazowe przetworzenie zdjęcia przez system AI.</li>
              <li><strong>Operator Płatności</strong> – Stripe Inc., za pośrednictwem którego realizowane są płatności.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 3. Rejestracja i konto</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Korzystanie z Serwisu wymaga założenia Konta przez podanie adresu e-mail i hasła lub zalogowanie przez konto Google.</li>
              <li>Użytkownik zobowiązany jest do podania prawdziwych danych i utrzymania ich aktualności.</li>
              <li>Użytkownik jest odpowiedzialny za bezpieczeństwo swojego hasła i wszelkie działania wykonane z jego Konta.</li>
              <li>Jedno Konto może być użytkowane wyłącznie przez jedną osobę, chyba że plan Agencja wyraźnie dopuszcza większą liczbę użytkowników.</li>
              <li>Usługodawca może usunąć Konto naruszające Regulamin.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 4. Plany subskrypcyjne i płatności</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Serwis oferuje płatne plany subskrypcyjne odnawiane miesięcznie:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li><strong>Starter</strong> – 97 zł brutto / miesiąc, 20 generacji</li>
                  <li><strong>Agent</strong> – 247 zł brutto / miesiąc, 80 generacji</li>
                  <li><strong>Agencja</strong> – 597 zł brutto / miesiąc, 300 generacji</li>
                </ul>
              </li>
              <li>Płatności obsługiwane są przez Stripe Inc. Dane karty płatniczej nie są przechowywane przez Stageria.</li>
              <li>Subskrypcja odnawia się automatycznie co miesiąc. Użytkownik może anulować ją w dowolnym momencie poprzez panel zarządzania subskrypcją — dostęp do Serwisu pozostaje aktywny do końca opłaconego okresu.</li>
              <li>Niewykorzystane generacje nie przechodzą na kolejny okres rozliczeniowy.</li>
              <li>Ceny podane są w złotych polskich (PLN) i zawierają podatek VAT.</li>
              <li>Faktury VAT wystawiane są automatycznie przez Stripe i dostępne w panelu klienta.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 5. Prawo odstąpienia od umowy</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Użytkownik będący konsumentem ma prawo odstąpić od umowy w terminie 14 dni od jej zawarcia, bez podawania przyczyny.</li>
              <li>Prawo odstąpienia nie przysługuje, jeżeli Usługodawca spełnił świadczenie w całości za wyraźną zgodą Użytkownika, który został poinformowany przed rozpoczęciem świadczenia, że po jego spełnieniu utraci prawo odstąpienia.</li>
              <li>Odstąpienie od umowy możliwe jest poprzez przesłanie oświadczenia na adres: wiesik4040@gmail.com.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 6. Prawa i obowiązki Użytkownika</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem i dobrymi obyczajami.</li>
              <li>Zabronione jest wgrywanie zdjęć naruszających prawa osób trzecich, treści bezprawnych, pornograficznych lub obraźliwych.</li>
              <li>Użytkownik jest wyłącznie odpowiedzialny za treść wgrywanych zdjęć oraz sposób wykorzystania wygenerowanych wizualizacji.</li>
              <li>Użytkownik oświadcza, że posiada prawa do wgrywanych zdjęć lub działa w imieniu podmiotu, który takie prawa posiada.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 7. Własność intelektualna</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Stageria udziela Użytkownikowi niewyłącznej, nieprzenoszalnej licencji na korzystanie z Serwisu na własne potrzeby zawodowe i gospodarcze.</li>
              <li>Wygenerowane wizualizacje mogą być wykorzystywane przez Użytkownika w celach komercyjnych, w tym w ogłoszeniach nieruchomości.</li>
              <li>Stageria nie przejmuje własności wgrywanych zdjęć — pozostają one własnością Użytkownika.</li>
              <li>Nazwa, logo i elementy graficzne Stageria są zastrzeżone i nie mogą być wykorzystywane bez zgody Usługodawcy.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 8. Odpowiedzialność i wyłączenia</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Stageria świadczy usługę w oparciu o technologię AI — wygenerowane wizualizacje mają charakter pomocniczy i mogą różnić się od rzeczywistego wyglądu pomieszczeń.</li>
              <li>Stageria nie gwarantuje ciągłości działania Serwisu i nie ponosi odpowiedzialności za przerwy techniczne, o których będzie informować z wyprzedzeniem, o ile to możliwe.</li>
              <li>Odpowiedzialność Stageria wobec Użytkownika będącego przedsiębiorcą ograniczona jest do wysokości opłat uiszczonych przez Użytkownika w ciągu ostatnich 3 miesięcy.</li>
              <li>Stageria nie ponosi odpowiedzialności za sposób, w jaki Użytkownik wykorzystuje wygenerowane wizualizacje.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 9. Reklamacje</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Reklamacje dotyczące działania Serwisu należy kierować na adres: <strong>wiesik4040@gmail.com</strong>.</li>
              <li>Reklamacja powinna zawierać: dane kontaktowe, opis problemu i oczekiwany sposób rozwiązania.</li>
              <li>Usługodawca rozpatruje reklamację w terminie 14 dni roboczych od jej otrzymania.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1A1410] mb-3">§ 10. Postanowienia końcowe</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego, w szczególności Kodeksu Cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</li>
              <li>Wszelkie spory będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy, z zastrzeżeniem praw konsumentów do wyboru sądu właściwego.</li>
              <li>Stageria zastrzega sobie prawo do zmiany Regulaminu z powiadomieniem Użytkowników drogą e-mail z 14-dniowym wyprzedzeniem.</li>
              <li>Regulamin wchodzi w życie z dniem 23 czerwca 2026 r.</li>
            </ol>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-[#8B6B44]/20">
          <Link href="/" className="text-sm text-[#C9A96E] hover:underline">← Powrót na stronę główną</Link>
        </div>
      </main>
    </div>
  );
}
