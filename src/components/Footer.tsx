export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-white/50 flex flex-col gap-2">
        <div>© {new Date().getFullYear()} Alex</div>
        <div className="text-white/40">Собрано так, чтобы завтра можно было масштабировать - кейсы, блог, англ-версия.</div>
      </div>
    </footer>
  );
}

