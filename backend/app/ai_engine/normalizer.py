import re
import unicodedata
from typing import Set

LOOKALIKE_MAP = {
    # Cyrillic lowercase
    '\u0430': 'a', '\u0441': 'c', '\u0435': 'e', '\u0456': 'i', '\u0458': 'j',
    '\u043e': 'o', '\u0440': 'p', '\u0455': 's', '\u0445': 'x', '\u0443': 'y',
    # Cyrillic uppercase
    '\u0410': 'A', '\u0412': 'B', '\u0415': 'E', '\u041a': 'K', '\u041c': 'M',
    '\u041d': 'H', '\u041e': 'O', '\u0420': 'P', '\u0421': 'C', '\u0422': 'T',
    '\u0425': 'X', '\u0406': 'I',
    # Greek
    '\u03bf': 'o', '\u03b1': 'a', '\u03b5': 'e', '\u03bd': 'v', '\u03c1': 'r'
}

ZERO_WIDTH_CHARS: Set[str] = {
    '\u200b', '\u200c', '\u200d', '\ufeff', '\u00ad', '\u2060'
}

NEGATION_WORDS: Set[str] = {
    "never", "not", "no", "dont", "wont", "without", "cannot", "cant",
    "doesnt", "didnt", "neither", "nor", "prohibits", "prohibit", "refuse",
    "hardly", "scarcely", "barely"
}

ATTR_PATTERN = re.compile(
    r'\b(competitor|competitors|claims?|claimed|claiming|advertis\w+|beware\s+of|'
    r'some\s+say|warning|fraudulent|unregulated|promoted\s+by|actors?|frequently\s+used|'
    r'warn|report\s+it|accuse|falsely|caution)\b',
    re.IGNORECASE
)

DEF_PATTERN = re.compile(
    r'\b(means?|is\s+defined\s+as|are\s+defined\s+as|what\s+is|by\s+definition|'
    r'the\s+term|the\s+phrase|definition\s+of|overview\s+of|concept\s+of|refer\s+to)\b',
    re.IGNORECASE
)

DEF_SUFFIX_PATTERN = re.compile(
    r'^\s*(means?|is\s+defined\s+as|would\s+require|refers\s+to)',
    re.IGNORECASE
)

DISCLAIMER_PHRASES = [
    "subject to market risk",  # matches "subject to market risk" and "subject to market risks"
    "terms and conditions apply",
    "terms and conditions",
    "past performance is no guarantee",
    "past performance is not indicative",
    "risk disclosure",
    "capital is not guaranteed",
    "all investments involve risk",
    "investment products are subject to market"
]


def normalize_text(text: str) -> str:
    """Normalizes text by NFKC, stripping zero-width chars, mapping lookalikes,

    and collapsing obfuscated single-letter hyphen/space separations.
    """
    # 1. Unicode NFKC
    norm = unicodedata.normalize('NFKC', text)

    # 2. Strip zero-width and invisible formatting characters
    for ch in ZERO_WIDTH_CHARS:
        norm = norm.replace(ch, '')

    # 3. Cyrillic / Greek lookalike mapping to Latin
    for src, dst in LOOKALIKE_MAP.items():
        norm = norm.replace(src, dst)

    # 4. Collapse leetspeak/capital O in percentages (e.g. 1OO% -> 100%)
    norm = re.sub(r'\b1[oO]{2}%', '100%', norm)

    # 5. Collapse single letters separated by hyphens/dots/spaces inside a word
    # (a) 3+ single letters separated by space: e.g. "g u a r a n t e e d" -> "guaranteed"
    def _collapse_spaces(m):
        return re.sub(r'\s+', '', m.group(0))
    norm = re.sub(r'\b(?:[a-zA-Z]\s+){3,}[a-zA-Z]\b', _collapse_spaces, norm)

    # (b) Hyphen / dot obfuscations: e.g. "g-uaranteed", "g.u.a.r.a.n.t.e.e.d", "r-i-s-k"
    norm = re.sub(r'\b([a-zA-Z])[-.]\s*([a-zA-Z]{2,})\b', r'\1\2', norm)
    norm = re.sub(r'\b([a-zA-Z])[-.]\s*([a-zA-Z])\b', r'\1\2', norm)

    return norm


def is_false_positive_context(normalized_text: str, start: int, end: int) -> bool:
    """Determines if a matched span appears in a negated, quoted, attributed,

    or definitional context that guards against false-positive violation flagging.
    """
    prefix = normalized_text[:start]
    suffix = normalized_text[end:]

    # (1) Negation within 4 tokens preceding the match
    tokens_before = [
        t.lower().replace("'", "")
        for t in re.findall(r"\b[a-zA-Z']+\b", prefix)[-4:]
    ]
    if any(tok in NEGATION_WORDS for tok in tokens_before):
        return True

    # (2) Inside quotation marks or after attribution words
    in_quotes = (
        (prefix.count('"') % 2 == 1 and suffix.count('"') % 2 == 1)
        or (prefix.count("'") % 2 == 1 and suffix.count("'") % 2 == 1)
        or (prefix.count('“') > prefix.count('”'))
        or (prefix.count('‘') > prefix.count('’'))
        or (prefix.rstrip().endswith(('"', "'", '“', '‘')) and suffix.lstrip().startswith(('"', "'", '”', '’')))
    )
    if in_quotes:
        return True

    if ATTR_PATTERN.search(prefix[-80:]):
        return True

    # (3) Definition patterns
    if DEF_PATTERN.search(prefix[-80:]):
        return True
    if DEF_SUFFIX_PATTERN.search(suffix[:40]):
        return True

    return False


def has_required_disclaimer(normalized_text: str) -> bool:
    """Checks whether the text contains an approved regulatory disclaimer."""
    lowered = normalized_text.lower()
    return any(p in lowered for p in DISCLAIMER_PHRASES)
