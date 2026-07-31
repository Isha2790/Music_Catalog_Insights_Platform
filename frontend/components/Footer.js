export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-ink-faint">
      Catalog data powered by the{' '}
      <a
        href="https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTunesSearchAPI/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-violet-soft hover:decoration-violet-soft"
      >
        iTunes Search API
      </a>
      .
    </footer>
  );
}
