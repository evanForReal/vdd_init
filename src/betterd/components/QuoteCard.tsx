import type { LanguageCode, Quote } from "../types";
import { TargetText } from "./TargetText";
import { SpeakerIcon } from "../../nutrition/components/Icons";
import { speak } from "../speech";

export function QuoteCard({ quote, language }: { quote: Quote; language: LanguageCode }) {
  return (
    <div className="quote-card">
      <div className="quote-card-header">
        <TargetText language={language} text={quote.native} className="quote-native" />
        <button
          className="icon-btn subtle"
          onClick={() => speak(quote.native, language)}
          aria-label="hear this quote"
        >
          <SpeakerIcon />
        </button>
      </div>
      {quote.transliteration && <div className="quote-translit">{quote.transliteration}</div>}
      <div className="quote-english">&ldquo;{quote.english}&rdquo;</div>
      <div className="quote-source">
        {quote.author ? `— ${quote.author}, ` : "— "}
        {quote.source}
      </div>
    </div>
  );
}
