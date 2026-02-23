// ---------- Helpers ----------
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const toast = $("#toast");
function showToast(msg="Tersalin"){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove("show"), 1100);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copied");
  }catch(e){
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Copied");
  }
}

function getActiveTabName(){
  return $(".tab-btn.active")?.dataset.tab || "sekolah";
}
function getActivePanel(){
  const name = getActiveTabName();
  return name === "sekolah" ? $("#tab-sekolah") : $("#tab-kuliah");
}
function normalize(s){
  return (s || "").toString().toLowerCase().trim();
}

// ---------- Tabs ----------
$$(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    const t = btn.dataset.tab;
    $("#tab-sekolah").classList.toggle("hide", t !== "sekolah");
    $("#tab-kuliah").classList.toggle("hide", t !== "kuliah");

    // reset search on tab switch
    $("#search").value = "";
    applySearch("");
  });
});

// ---------- Query item actions ----------
function wirePanel(panel){
  // Copy button
  $$("[data-copy]", panel).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const item = btn.closest(".q-item");
      const code = $("pre code", item)?.innerText || "";
      copyText(code);
    });
  });

  // Explain toggle
  $$("[data-explain]", panel).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const item = btn.closest(".q-item");
      const box = $(".explain", item);
      if(!box) return;
      box.classList.toggle("hide");
      btn.textContent = box.classList.contains("hide") ? "👩‍🏫 Keterangan guru" : "🙈 Tutup keterangan";
    });
  });
}
wirePanel($("#tab-sekolah"));
wirePanel($("#tab-kuliah"));

// ---------- Expand/Collapse All ----------
$("#expandAll").addEventListener("click", ()=>{
  const panel = getActivePanel();
  $$("details", panel).forEach(d=>d.open = true);
  $$(".q-item .explain", panel).forEach(e=>e.classList.remove("hide"));
  $$(".q-item [data-explain]", panel).forEach(b=>b.textContent="🙈 Tutup keterangan");
  showToast("Semua dibuka");
});

$("#collapseAll").addEventListener("click", ()=>{
  const panel = getActivePanel();
  $$("details", panel).forEach(d=>d.open = false);
  $$(".q-item .explain", panel).forEach(e=>e.classList.add("hide"));
  $$(".q-item [data-explain]", panel).forEach(b=>b.textContent="👩‍🏫 Keterangan guru");
  showToast("Semua ditutup");
});

// ---------- Copy All Queries in Active Tab ----------
$("#copyAll").addEventListener("click", ()=>{
  const panel = getActivePanel();
  const codes = $$("pre code", panel).map(c=>c.innerText.trim()).filter(Boolean);
  const merged = codes.join("\n\n-- ------------------------------\n\n");
  copyText(merged);
});

// ---------- Search / Filter ----------
function applySearch(q){
  const query = normalize(q);
  const panel = getActivePanel();

  // filter q-items
  $$(".q-item", panel).forEach(item=>{
    const hay = normalize(item.dataset.search) + " " + normalize(item.innerText);
    item.classList.toggle("hide", query && !hay.includes(query));
  });

  // filter schema tables
  $$(".table", panel).forEach(t=>{
    const hay = normalize(t.innerText);
    t.classList.toggle("hide", query && !hay.includes(query));
  });
}

$("#search").addEventListener("input", (e)=>applySearch(e.target.value));

// Ctrl+K focus search + Esc clear search
window.addEventListener("keydown", (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
    e.preventDefault();
    $("#search").focus();
  }
  if(e.key === "Escape"){
    const s = $("#search");
    if(document.activeElement === s){
      s.value = "";
      applySearch("");
      s.blur();
      showToast("Search dibersihkan");
    }
  }
});

// initial
applySearch("");
