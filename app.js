
document.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if(tab){
    const name = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelectorAll(".pane").forEach(p => p.classList.remove("is-active"));
    const pane = document.getElementById("pane-" + name);
    if(pane) pane.classList.add("is-active");
  }

  const btn = e.target.closest("[data-copy]");
  if(btn){
    const id = btn.dataset.copy;
    const el = document.getElementById(id);
    if(!el) return;
    const text = el.dataset.raw ? el.dataset.raw : el.innerText;

    const done = () => {
      const old = btn.textContent;
      btn.classList.add("btn--copied");
      btn.textContent = "Tersalin ✓";
      setTimeout(() => { btn.textContent = old; btn.classList.remove("btn--copied"); }, 900);
    };

    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        done();
      });
    }else{
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done();
    }
  }
});
